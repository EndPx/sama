// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {EligibilityRegistry} from "../src/EligibilityRegistry.sol";
import {EquityLinkedToken} from "../src/EquityLinkedToken.sol";
import {KiranaOffering} from "../src/KiranaOffering.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

abstract contract OfferingPropertyBase is Test {
    uint256 internal constant USDC = 1e6;
    uint256 internal constant FLOOR = 4_000_000 * USDC;
    uint256 internal constant CEILING = 6_000_000 * USDC;
    uint256 internal constant MINIMUM_RAISE = 400_000 * USDC;
    address internal admin = makeAddr("property-admin");
    MockUSDC internal usdc;
    EligibilityRegistry internal registry;
    EquityLinkedToken internal kira;

    function setUp() public virtual {
        vm.warp(1_000_000);
        usdc = new MockUSDC();
        vm.prank(admin);
        registry = new EligibilityRegistry(admin);
        vm.prank(admin);
        kira = new EquityLinkedToken(admin, address(registry), 1_000_000 ether);
    }

    function _offering() internal returns (KiranaOffering offering) {
        vm.prank(admin);
        offering = new KiranaOffering(
            admin,
            address(usdc),
            address(kira),
            address(registry),
            uint64(block.timestamp + 1),
            uint64(block.timestamp + 10),
            uint64(block.timestamp + 20)
        );
        bytes32 minterRole = kira.MINTER_ROLE();
        vm.prank(admin);
        kira.grantRole(minterRole, address(offering));
    }

    function _fundAndCommit(KiranaOffering offering, address bidder, uint128 amount, uint64 fdv, bytes32 nonce)
        internal
    {
        vm.startPrank(admin);
        registry.setEligible(bidder, true);
        usdc.mint(bidder, amount);
        vm.stopPrank();
        vm.prank(bidder);
        usdc.approve(address(offering), type(uint256).max);
        bytes32 commitment = offering.commitmentFor(bidder, amount, fdv, nonce);
        vm.prank(bidder);
        offering.commitBid(commitment, amount);
    }

    function _reveal(KiranaOffering offering, address bidder, uint128 amount, uint64 fdv, bytes32 nonce) internal {
        vm.prank(bidder);
        offering.revealBid(amount, fdv, nonce);
    }
}

contract AuctionReferenceModelFuzzTest is OfferingPropertyBase {
    struct Model {
        bool successful;
        uint256 clearingFdv;
        uint256 acceptedTotal;
        uint256[] accepted;
        uint256[] refunds;
    }

    function testFuzzSettlementMatchesAuctionSpecification(uint256 seed, uint8 rawCount, uint8 rawScenario) public {
        uint256 count = bound(rawCount, 2, 16);
        uint256 scenario = rawScenario % 4;
        KiranaOffering offering = _offering();
        address[] memory ordered = new address[](count);
        uint256[] memory amounts = new uint256[](count);
        uint256[] memory fdvs = new uint256[](count);

        vm.warp(offering.commitStart());
        for (uint256 i; i < count; ++i) {
            ordered[i] = address(uint160(i + 1));
            // Scenarios cover tier clearing, floor fallback, minimum-raise failure, and equal marginal tiers with dust.
            if (scenario == 0) {
                amounts[i] = 300_000 * USDC + i + 1;
                fdvs[i] = 4_800_000 * USDC;
            } else if (scenario == 1) {
                amounts[i] = (450_000 * USDC + (seed % 10_000)) / count;
                fdvs[i] = 5_000_000 * USDC;
            } else if (scenario == 2) {
                amounts[i] = 10_000 * USDC + i;
                fdvs[i] = 4_000_000 * USDC;
            } else {
                amounts[i] = 300_000 * USDC + ((seed >> (i % 32)) % 17) + i;
                fdvs[i] = i == 0 ? 5_000_000 * USDC : 4_800_000 * USDC;
            }
            _fundAndCommit(offering, ordered[i], uint128(amounts[i]), uint64(fdvs[i]), bytes32(i + 1));
        }
        vm.warp(offering.commitEnd());
        for (uint256 i; i < count; ++i) {
            _reveal(offering, ordered[i], uint128(amounts[i]), uint64(fdvs[i]), bytes32(i + 1));
        }
        vm.warp(offering.revealEnd());

        Model memory model = _model(amounts, fdvs);
        offering.settle(ordered);
        assertEq(offering.successful(), model.successful);
        assertEq(offering.clearingFdv(), model.clearingFdv);
        assertEq(offering.acceptedTotal(), model.acceptedTotal);
        assertEq(offering.acceptedTotal() + offering.totalRefundLiability(), offering.totalCommitted());
        for (uint256 i; i < count; ++i) {
            assertEq(offering.acceptedOf(ordered[i]), model.accepted[i]);
            assertEq(offering.refundable(ordered[i]), model.refunds[i]);
            assertLe(offering.acceptedOf(ordered[i]), amounts[i]);
            if (offering.acceptedOf(ordered[i]) != 0) assertGe(fdvs[i], offering.clearingFdv());
            if (model.successful) assertLe(offering.tokenAllocation(ordered[i]), offering.offeredSupply());
        }
    }

    function _model(uint256[] memory amounts, uint256[] memory fdvs) internal pure returns (Model memory model) {
        uint256 count = amounts.length;
        model.accepted = new uint256[](count);
        model.refunds = new uint256[](count);
        uint256 demand;
        uint256 candidate;
        for (uint256 i; i < count; ++i) {
            demand += amounts[i];
            if (i + 1 == count || fdvs[i] != fdvs[i + 1]) {
                // A tier is a candidate only when the cumulative demand at that
                // tier can purchase the offered 10% allocation. Otherwise the
                // specification requires continuing through lower tiers.
                if (demand >= fdvs[i] / 10) {
                    candidate = fdvs[i];
                    break;
                }
            }
        }
        bool floorFallback;
        if (candidate == 0) {
            if (demand < MINIMUM_RAISE) {
                for (uint256 i; i < count; ++i) {
                    model.refunds[i] = amounts[i];
                }
                return model;
            }
            candidate = FLOOR;
            floorFallback = true;
        }
        uint256 capacity = candidate / 10;
        uint256 above;
        uint256 atTier;
        for (uint256 i; i < count; ++i) {
            if (!floorFallback && fdvs[i] > candidate) above += amounts[i];
            else if (floorFallback || fdvs[i] == candidate) atTier += amounts[i];
        }
        uint256 remaining = capacity - above;
        uint256 allocated;
        for (uint256 i; i < count; ++i) {
            uint256 accepted = !floorFallback && fdvs[i] > candidate
                ? amounts[i]
                : ((floorFallback || fdvs[i] == candidate) ? amounts[i] * remaining / atTier : 0);
            model.accepted[i] = accepted;
            model.refunds[i] = amounts[i] - accepted;
            allocated += accepted;
        }
        for (uint256 i; allocated < capacity && i < count; ++i) {
            if ((floorFallback || fdvs[i] == candidate) && model.accepted[i] < amounts[i]) {
                ++model.accepted[i];
                --model.refunds[i];
                ++allocated;
            }
        }
        model.successful = true;
        model.clearingFdv = candidate;
        model.acceptedTotal = allocated;
    }
}

contract SettlementInputMutationFuzzTest is OfferingPropertyBase {
    function testFuzzSettlementInputMutationsRevert(uint8 mutation) public {
        KiranaOffering offering = _offering();
        address a = address(1);
        address b = address(2);
        address c = address(3);
        address unrevealed = address(4);
        vm.warp(offering.commitStart());
        _fundAndCommit(offering, a, uint128(300_000 * USDC), uint64(5_000_000 * USDC), bytes32("a"));
        _fundAndCommit(offering, b, uint128(300_000 * USDC), uint64(4_800_000 * USDC), bytes32("b"));
        _fundAndCommit(offering, c, uint128(1), uint64(4_800_000 * USDC), bytes32("c"));
        _fundAndCommit(offering, unrevealed, uint128(1), uint64(4_000_000 * USDC), bytes32("u"));
        vm.warp(offering.commitEnd());
        _reveal(offering, a, uint128(300_000 * USDC), uint64(5_000_000 * USDC), bytes32("a"));
        _reveal(offering, b, uint128(300_000 * USDC), uint64(4_800_000 * USDC), bytes32("b"));
        _reveal(offering, c, uint128(1), uint64(4_800_000 * USDC), bytes32("c"));
        address[] memory list = new address[](3);
        mutation = uint8(bound(mutation, 0, 5));
        if (mutation == 0) {
            list = new address[](2);
            list[0] = a;
            list[1] = b;
        } else if (mutation == 1) {
            list[0] = a;
            list[1] = b;
            list[2] = b;
        } else if (mutation == 2) {
            list[0] = a;
            list[1] = b;
            list[2] = unrevealed;
        } else if (mutation == 3) {
            list[0] = b;
            list[1] = a;
            list[2] = c;
        } else if (mutation == 4) {
            list[0] = a;
            list[1] = c;
            list[2] = b;
        } else {
            list = new address[](0);
        }
        vm.warp(offering.revealEnd());
        vm.expectRevert(KiranaOffering.InvalidBidderList.selector);
        offering.settle(list);
    }

    function testSettlementBeforeEndAndSecondSettlementRevert() public {
        KiranaOffering offering = _offering();
        address a = address(1);
        vm.warp(offering.commitStart());
        _fundAndCommit(offering, a, uint128(450_000 * USDC), uint64(FLOOR), bytes32("a"));
        vm.warp(offering.commitEnd());
        _reveal(offering, a, uint128(450_000 * USDC), uint64(FLOOR), bytes32("a"));
        address[] memory list = new address[](1);
        list[0] = a;
        vm.expectRevert(KiranaOffering.WrongPhase.selector);
        offering.settle(list);
        vm.warp(offering.revealEnd());
        offering.settle(list);
        vm.expectRevert(KiranaOffering.WrongPhase.selector);
        offering.settle(list);
    }
}

contract AccountingHandler {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    KiranaOffering internal immutable success;
    KiranaOffering internal immutable failed;
    KiranaOffering internal immutable cancelled;
    address internal immutable issuer;
    address[2] internal successActors;
    address[2] internal failedActors;
    address[2] internal cancelledActors;
    uint256 public successRefundsPaid;
    uint256 public failedRefundsPaid;
    uint256 public cancelledRefundsPaid;
    uint256 public successRefundClaims;
    uint256 public failedRefundClaims;
    uint256 public cancelledRefundClaims;
    uint256 public tokenClaims;
    uint256 public proceedsWithdrawals;

    // Ghost counters track paid liabilities so invariants can express conservation after pull claims.
    constructor(
        KiranaOffering success_,
        KiranaOffering failed_,
        KiranaOffering cancelled_,
        address issuer_,
        address successFirst,
        address successSecond,
        address failedFirst,
        address failedSecond,
        address cancelledFirst,
        address cancelledSecond
    ) {
        success = success_;
        failed = failed_;
        cancelled = cancelled_;
        issuer = issuer_;
        successActors[0] = successFirst;
        successActors[1] = successSecond;
        failedActors[0] = failedFirst;
        failedActors[1] = failedSecond;
        cancelledActors[0] = cancelledFirst;
        cancelledActors[1] = cancelledSecond;
    }

    function claimSuccessfulRefund(uint256 seed) external {
        address actor = successActors[seed % 2];
        uint256 amount = success.refundable(actor);
        if (amount == 0) return;
        vm.prank(actor);
        success.claimRefund();
        successRefundsPaid += amount;
        ++successRefundClaims;
    }

    function claimFailedRefund(uint256 seed) external {
        address actor = failedActors[seed % 2];
        uint256 amount = failed.refundable(actor);
        if (amount == 0) return;
        vm.prank(actor);
        failed.claimRefund();
        failedRefundsPaid += amount;
        ++failedRefundClaims;
    }

    function claimCancelledRefund(uint256 seed) external {
        address actor = cancelledActors[seed % 2];
        (, uint128 amount,,,,,, bool refundClaimed) = cancelled.bids(actor);
        if (!refundClaimed && amount != 0) {
            vm.prank(actor);
            cancelled.claimRefund();
            cancelledRefundsPaid += amount;
            ++cancelledRefundClaims;
        }
    }

    function claimSuccessfulTokens(uint256 seed) external {
        address actor = successActors[seed % 2];
        (,,,,, bool revealed, bool tokenClaimed,) = success.bids(actor);
        if (revealed && !tokenClaimed && success.tokenAllocation(actor) != 0) {
            vm.prank(actor);
            success.claimTokens();
            ++tokenClaims;
        }
    }

    function withdrawSuccessfulProceeds() external {
        if (success.issuerWithdrawn()) return;
        vm.prank(issuer);
        success.withdrawIssuerProceeds();
        ++proceedsWithdrawals;
    }
}

contract OfferingAccountingInvariantTest is OfferingPropertyBase {
    KiranaOffering internal successOffering;
    KiranaOffering internal failedOffering;
    KiranaOffering internal cancelledOffering;
    AccountingHandler internal handler;
    address internal successFirst = address(101);
    address internal successSecond = address(102);
    address internal failedFirst = address(201);
    address internal failedSecond = address(202);
    address internal cancelledFirst = address(301);
    address internal cancelledSecond = address(302);

    function setUp() public override {
        super.setUp();
        successOffering = _offering();
        vm.warp(successOffering.commitStart());
        _fundAndCommit(successOffering, successFirst, uint128(450_000 * USDC), uint64(FLOOR), bytes32("s1"));
        _fundAndCommit(successOffering, successSecond, uint128(50_000 * USDC), uint64(FLOOR), bytes32("s2"));
        vm.warp(successOffering.commitEnd());
        _reveal(successOffering, successFirst, uint128(450_000 * USDC), uint64(FLOOR), bytes32("s1"));
        _reveal(successOffering, successSecond, uint128(50_000 * USDC), uint64(FLOOR), bytes32("s2"));
        vm.warp(successOffering.revealEnd());
        address[] memory successList = new address[](2);
        successList[0] = successFirst;
        successList[1] = successSecond;
        successOffering.settle(successList);

        failedOffering = _offering();
        vm.warp(failedOffering.commitStart());
        _fundAndCommit(failedOffering, failedFirst, uint128(100_000 * USDC), uint64(FLOOR), bytes32("f1"));
        _fundAndCommit(failedOffering, failedSecond, uint128(100_000 * USDC), uint64(FLOOR), bytes32("f2"));
        vm.warp(failedOffering.commitEnd());
        _reveal(failedOffering, failedFirst, uint128(100_000 * USDC), uint64(FLOOR), bytes32("f1"));
        _reveal(failedOffering, failedSecond, uint128(100_000 * USDC), uint64(FLOOR), bytes32("f2"));
        vm.warp(failedOffering.revealEnd());
        address[] memory failedList = new address[](2);
        failedList[0] = failedFirst;
        failedList[1] = failedSecond;
        failedOffering.settle(failedList);

        cancelledOffering = _offering();
        vm.warp(cancelledOffering.commitStart());
        _fundAndCommit(cancelledOffering, cancelledFirst, uint128(100_000 * USDC), uint64(FLOOR), bytes32("c1"));
        _fundAndCommit(cancelledOffering, cancelledSecond, uint128(200_000 * USDC), uint64(FLOOR), bytes32("c2"));
        vm.prank(admin);
        cancelledOffering.cancel();
        handler = new AccountingHandler(
            successOffering,
            failedOffering,
            cancelledOffering,
            admin,
            successFirst,
            successSecond,
            failedFirst,
            failedSecond,
            cancelledFirst,
            cancelledSecond
        );
        bytes4[] memory selectors = new bytes4[](5);
        selectors[0] = AccountingHandler.claimSuccessfulRefund.selector;
        selectors[1] = AccountingHandler.claimFailedRefund.selector;
        selectors[2] = AccountingHandler.claimCancelledRefund.selector;
        selectors[3] = AccountingHandler.claimSuccessfulTokens.selector;
        selectors[4] = AccountingHandler.withdrawSuccessfulProceeds.selector;
        targetContract(address(handler));
        targetSelector(FuzzSelector({addr: address(handler), selectors: selectors}));
    }

    function invariant_escrowSolvency() public view {
        _assertSolvent(successOffering);
        _assertSolvent(failedOffering);
        _assertSolvent(cancelledOffering);
    }

    function invariant_financialConservation() public view {
        assertEq(
            successOffering.acceptedTotal() + successOffering.totalRefundLiability() + handler.successRefundsPaid(),
            successOffering.totalCommitted()
        );
        assertEq(failedOffering.totalRefundLiability() + handler.failedRefundsPaid(), failedOffering.totalCommitted());
        assertEq(
            cancelledOffering.totalRefundLiability() + handler.cancelledRefundsPaid(),
            cancelledOffering.totalCommitted()
        );
    }

    function invariant_tokenAndClaimConservation() public view {
        assertLe(successOffering.totalTokenAllocated(), successOffering.offeredSupply());
        assertLe(kira.totalSupply(), kira.cap());
        assertLe(
            successOffering.tokenAllocation(successFirst) + successOffering.tokenAllocation(successSecond),
            successOffering.offeredSupply()
        );
        assertLe(kira.balanceOf(successFirst) + kira.balanceOf(successSecond), successOffering.offeredSupply());
        assertEq(failedOffering.totalTokenAllocated(), 0);
        assertEq(cancelledOffering.totalTokenAllocated(), 0);
        assertLe(handler.proceedsWithdrawals(), 1);
        assertLe(handler.successRefundClaims(), 2);
        assertLe(handler.failedRefundClaims(), 2);
        assertLe(handler.cancelledRefundClaims(), 2);
        assertLe(handler.tokenClaims(), 2);
        assertEq(
            handler.successRefundClaims(),
            _refundClaimed(successOffering, successFirst) + _refundClaimed(successOffering, successSecond)
        );
        assertEq(
            handler.failedRefundClaims(),
            _refundClaimed(failedOffering, failedFirst) + _refundClaimed(failedOffering, failedSecond)
        );
        assertEq(
            handler.cancelledRefundClaims(),
            _refundClaimed(cancelledOffering, cancelledFirst) + _refundClaimed(cancelledOffering, cancelledSecond)
        );
        assertEq(
            handler.tokenClaims(),
            _tokenClaimed(successOffering, successFirst) + _tokenClaimed(successOffering, successSecond)
        );
        assertEq(handler.proceedsWithdrawals(), successOffering.issuerWithdrawn() ? 1 : 0);
        assertEq(kira.balanceOf(failedFirst), 0);
        assertEq(kira.balanceOf(failedSecond), 0);
        assertEq(kira.balanceOf(cancelledFirst), 0);
        assertEq(kira.balanceOf(cancelledSecond), 0);
        _assertBidIntegrity(successOffering, successFirst);
        _assertBidIntegrity(successOffering, successSecond);
    }

    function _assertSolvent(KiranaOffering offering) internal view {
        uint256 proceeds = offering.issuerWithdrawn() ? 0 : offering.issuerProceeds();
        assertEq(usdc.balanceOf(address(offering)), offering.totalRefundLiability() + proceeds);
    }

    function _assertBidIntegrity(KiranaOffering offering, address bidder) internal view {
        (, uint128 amount, uint64 fdv, uint128 accepted,,,,) = offering.bids(bidder);
        assertLe(accepted, amount);
        if (accepted != 0) assertGe(fdv, offering.clearingFdv());
    }

    function _refundClaimed(KiranaOffering offering, address bidder) internal view returns (uint256) {
        (,,,,,,, bool claimed) = offering.bids(bidder);
        return claimed ? 1 : 0;
    }

    function _tokenClaimed(KiranaOffering offering, address bidder) internal view returns (uint256) {
        (,,,,,, bool claimed,) = offering.bids(bidder);
        return claimed ? 1 : 0;
    }
}
