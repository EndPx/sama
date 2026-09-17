// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {EligibilityRegistry} from "../src/EligibilityRegistry.sol";
import {EquityLinkedToken} from "../src/EquityLinkedToken.sol";
import {KiranaOffering} from "../src/KiranaOffering.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract KiranaOfferingTest is Test {
    uint256 internal constant USDC = 1e6;
    uint256 internal constant MAXIMUM_SETTLEMENT_BIDDER_COUNT = 64;
    uint256 internal constant MAX_SETTLE_GAS = 2_500_000;
    uint256 internal constant MAXIMUM_SETTLEMENT_CAPACITY = 480_000 * USDC;
    uint256 internal constant MAXIMUM_SETTLEMENT_REGULAR_BID = 7_500 * USDC;
    uint256 internal constant MAXIMUM_SETTLEMENT_FDV = 4_800_000 * USDC;
    address internal admin = makeAddr("admin");
    address internal a = makeAddr("a");
    address internal b = makeAddr("b");
    address internal c = makeAddr("c");
    address internal d = makeAddr("d");
    address internal e = makeAddr("e");
    MockUSDC internal usdc;
    EligibilityRegistry internal registry;
    EquityLinkedToken internal kira;
    KiranaOffering internal offering;

    function setUp() public {
        vm.warp(1_000_000);
        vm.startPrank(admin);
        registry = new EligibilityRegistry(admin);
        kira = new EquityLinkedToken(admin, address(registry), 1_000_000 ether);
        offering = new KiranaOffering(
            admin,
            address(usdc = new MockUSDC()),
            address(kira),
            address(registry),
            uint64(block.timestamp + 1),
            uint64(block.timestamp + 10),
            uint64(block.timestamp + 20)
        );
        kira.grantRole(kira.MINTER_ROLE(), address(offering));
        registry.setEligible(a, true);
        registry.setEligible(b, true);
        registry.setEligible(c, true);
        registry.setEligible(d, true);
        registry.setEligible(e, true);
        vm.stopPrank();
        address[5] memory bidders = [a, b, c, d, e];
        for (uint256 i; i < bidders.length; ++i) {
            usdc.mint(bidders[i], 500_000 * USDC);
            vm.prank(bidders[i]);
            usdc.approve(address(offering), type(uint256).max);
        }
    }

    function testReferenceCaseClearsAndClaimsConserveAssets() public {
        _commitAndReveal(e, 150_000 * USDC, 5_400_000 * USDC, bytes32("e"));
        _commitAndReveal(d, 200_000 * USDC, 5_200_000 * USDC, bytes32("d"));
        _commitAndReveal(c, 100_000 * USDC, 5_000_000 * USDC, bytes32("c"));
        _commitAndReveal(b, 150_000 * USDC, 4_800_000 * USDC, bytes32("b"));
        _commitAndReveal(a, 100_000 * USDC, 4_500_000 * USDC, bytes32("a"));
        vm.warp(offering.revealEnd());
        address[] memory ordered = new address[](5);
        ordered[0] = e;
        ordered[1] = d;
        ordered[2] = c;
        ordered[3] = b;
        ordered[4] = a;
        offering.settle(ordered);
        assertTrue(offering.successful());
        assertEq(offering.clearingFdv(), 4_800_000 * USDC);
        assertEq(offering.acceptedTotal(), 480_000 * USDC);
        assertEq(offering.acceptedOf(b), 30_000 * USDC);
        assertEq(offering.refundable(b), 120_000 * USDC);
        assertEq(offering.refundable(a), 100_000 * USDC);
        vm.prank(b);
        offering.claimTokens();
        vm.prank(b);
        offering.claimRefund();
        vm.prank(a);
        offering.claimRefund();
        assertEq(kira.balanceOf(b), 62_500 ether);
        assertEq(usdc.balanceOf(b), 470_000 * USDC);
        assertEq(usdc.balanceOf(a), 500_000 * USDC);
    }

    function testRejectsEarlyAndIncompleteSettlement() public {
        _commitAndReveal(a, 400_000 * USDC, 4_000_000 * USDC, bytes32("a"));
        vm.expectRevert(KiranaOffering.WrongPhase.selector);
        offering.settle(new address[](0));
        vm.warp(offering.revealEnd());
        vm.expectRevert(KiranaOffering.InvalidBidderList.selector);
        offering.settle(new address[](0));
    }

    function testRevealBoundaryIsExclusive() public {
        uint128 amount = uint128(450_000 * USDC);
        uint64 fdv = uint64(6_000_000 * USDC);
        vm.warp(offering.commitStart());
        bytes32 commitment = offering.commitmentFor(a, amount, fdv, bytes32("late"));
        vm.prank(a);
        offering.commitBid(commitment, amount);
        vm.warp(offering.revealEnd());
        vm.prank(a);
        vm.expectRevert(KiranaOffering.WrongPhase.selector);
        offering.revealBid(amount, fdv, bytes32("late"));
        vm.warp(offering.revealEnd() + 1);
        vm.prank(a);
        vm.expectRevert(KiranaOffering.WrongPhase.selector);
        offering.revealBid(amount, fdv, bytes32("late"));
    }

    function testFloorFallbackAllocatesOnlyFloorCapacity() public {
        _commitAndReveal(a, 450_000 * USDC, 6_000_000 * USDC, bytes32("floor"));
        vm.warp(offering.revealEnd());
        address[] memory ordered = new address[](1);
        ordered[0] = a;
        offering.settle(ordered);
        assertEq(offering.clearingFdv(), 4_000_000 * USDC);
        assertEq(offering.acceptedOf(a), 400_000 * USDC);
        assertEq(offering.refundable(a), 50_000 * USDC);
    }

    function testRoundingDustIsDeterministicAndRefundsThenProceedsSucceed() public {
        _commitAndReveal(a, 479_999_999_999, 5_000_000 * USDC, bytes32("ra"));
        _commitAndReveal(b, 1, 4_800_000 * USDC, bytes32("rb"));
        _commitAndReveal(c, 1, 4_800_000 * USDC, bytes32("rc"));
        vm.warp(offering.revealEnd());
        address[] memory ordered = new address[](3);
        ordered[0] = a;
        if (uint160(b) < uint160(c)) {
            ordered[1] = b;
            ordered[2] = c;
        } else {
            ordered[1] = c;
            ordered[2] = b;
        }
        offering.settle(ordered);
        assertEq(offering.acceptedOf(a), 479_999_999_999);
        assertEq(offering.acceptedOf(ordered[1]), 1);
        assertEq(offering.acceptedOf(ordered[2]), 0);
        assertEq(offering.acceptedTotal() + offering.totalRefundLiability(), offering.totalCommitted());
        vm.prank(ordered[2]);
        offering.claimRefund();
        vm.prank(admin);
        offering.withdrawIssuerProceeds();
        assertEq(usdc.balanceOf(address(offering)), offering.totalRefundLiability());
    }

    function testRoundingDustIssuerWithdrawalThenRefundSucceeds() public {
        address refundableBidder = _settleMicroDustFixture();
        uint256 issuerBefore = usdc.balanceOf(admin);
        uint256 bidderBefore = usdc.balanceOf(refundableBidder);
        assertEq(usdc.balanceOf(address(offering)), offering.issuerProceeds() + offering.totalRefundLiability());
        vm.prank(admin);
        offering.withdrawIssuerProceeds();
        assertEq(usdc.balanceOf(admin), issuerBefore + offering.issuerProceeds());
        assertEq(usdc.balanceOf(address(offering)), offering.totalRefundLiability());
        uint256 refund = offering.refundable(refundableBidder);
        vm.prank(refundableBidder);
        offering.claimRefund();
        assertEq(usdc.balanceOf(refundableBidder), bidderBefore + refund);
        assertEq(offering.totalRefundLiability(), 0);
        assertEq(usdc.balanceOf(address(offering)), 0);
    }

    function testRoundingDustRefundThenIssuerWithdrawalDischargesEscrow() public {
        address refundableBidder = _settleMicroDustFixture();
        uint256 bidderBefore = usdc.balanceOf(refundableBidder);
        uint256 refund = offering.refundable(refundableBidder);
        vm.prank(refundableBidder);
        offering.claimRefund();
        assertEq(usdc.balanceOf(refundableBidder), bidderBefore + refund);
        assertEq(usdc.balanceOf(address(offering)), offering.issuerProceeds());
        uint256 issuerBefore = usdc.balanceOf(admin);
        vm.prank(admin);
        offering.withdrawIssuerProceeds();
        assertEq(usdc.balanceOf(admin), issuerBefore + offering.issuerProceeds());
        assertEq(offering.totalRefundLiability(), 0);
        assertEq(usdc.balanceOf(address(offering)), 0);
    }

    function testSuccessfulOfferingRefundsUnrevealedBidAndMintsNoKira() public {
        _commitAndReveal(a, 450_000 * USDC, 4_000_000 * USDC, bytes32("winner"));
        _commitOnly(b, 20_000 * USDC, bytes32("sealed"));
        uint256 winnerBefore = usdc.balanceOf(a);
        uint256 sealedBefore = usdc.balanceOf(b);
        vm.warp(offering.revealEnd());
        address[] memory ordered = new address[](1);
        ordered[0] = a;
        offering.settle(ordered);
        assertEq(offering.acceptedOf(b), 0);
        assertEq(offering.tokenAllocation(b), 0);
        assertEq(kira.balanceOf(b), 0);
        assertEq(offering.refundable(b), 20_000 * USDC);
        vm.prank(b);
        offering.claimRefund();
        assertEq(usdc.balanceOf(b), sealedBefore + 20_000 * USDC);
        assertEq(offering.totalRefundLiability(), 50_000 * USDC);
        vm.prank(b);
        vm.expectRevert(KiranaOffering.AlreadyClaimed.selector);
        offering.claimRefund();
        vm.prank(b);
        vm.expectRevert(KiranaOffering.NothingToClaim.selector);
        offering.claimTokens();
        vm.prank(a);
        offering.claimRefund();
        assertEq(usdc.balanceOf(a), winnerBefore + 50_000 * USDC);
        uint256 issuerBefore = usdc.balanceOf(admin);
        vm.prank(admin);
        offering.withdrawIssuerProceeds();
        assertEq(usdc.balanceOf(admin), issuerBefore + 400_000 * USDC);
        assertEq(offering.totalRefundLiability(), 0);
        assertEq(usdc.balanceOf(address(offering)), 0);
        assertEq(kira.balanceOf(b), 0);
    }

    function testUnsuccessfulSettlementRefundsRevealedAndUnrevealedInAnyOrder() public {
        _commitAndReveal(a, 100_000 * USDC, 4_000_000 * USDC, bytes32("failed-revealed"));
        _commitOnly(b, 20_000 * USDC, bytes32("failed-sealed"));
        _commitOnly(c, 30_000 * USDC, bytes32("failed-sealed-two"));
        uint256 aBefore = usdc.balanceOf(a);
        uint256 bBefore = usdc.balanceOf(b);
        uint256 cBefore = usdc.balanceOf(c);
        vm.warp(offering.revealEnd());
        address[] memory ordered = new address[](1);
        ordered[0] = a;
        offering.settle(ordered);
        assertFalse(offering.successful());
        assertEq(offering.totalRefundLiability(), 150_000 * USDC);
        assertEq(kira.balanceOf(a), 0);
        assertEq(kira.balanceOf(b), 0);
        vm.prank(a);
        vm.expectRevert(KiranaOffering.NotSuccessful.selector);
        offering.claimTokens();
        vm.prank(b);
        offering.claimRefund();
        assertEq(usdc.balanceOf(b), bBefore + 20_000 * USDC);
        assertEq(offering.totalRefundLiability(), 130_000 * USDC);
        assertEq(usdc.balanceOf(address(offering)), offering.totalRefundLiability());
        vm.prank(c);
        offering.claimRefund();
        assertEq(usdc.balanceOf(c), cBefore + 30_000 * USDC);
        assertEq(offering.totalRefundLiability(), 100_000 * USDC);
        assertEq(usdc.balanceOf(address(offering)), offering.totalRefundLiability());
        vm.prank(a);
        offering.claimRefund();
        assertEq(usdc.balanceOf(a), aBefore + 100_000 * USDC);
        assertEq(offering.totalRefundLiability(), 0);
        assertEq(usdc.balanceOf(address(offering)), 0);
    }

    function testCancellationRefundRestoresBidderAndClearsLiability() public {
        vm.warp(offering.commitStart());
        uint256 beforeBalance = usdc.balanceOf(a);
        bytes32 commitment = offering.commitmentFor(a, 100_000 * USDC, 4_000_000 * USDC, bytes32("cancel"));
        vm.prank(a);
        offering.commitBid(commitment, uint128(100_000 * USDC));
        vm.prank(admin);
        offering.cancel();
        assertEq(offering.totalRefundLiability(), 100_000 * USDC);
        vm.prank(a);
        offering.claimRefund();
        assertEq(usdc.balanceOf(a), beforeBalance);
        assertEq(offering.totalRefundLiability(), 0);
        vm.prank(a);
        vm.expectRevert(KiranaOffering.AlreadyClaimed.selector);
        offering.claimRefund();
        vm.prank(admin);
        vm.expectRevert(KiranaOffering.WrongPhase.selector);
        offering.cancel();
    }

    function testCancelBeforeCommitHasNoLiability() public {
        vm.prank(admin);
        offering.cancel();
        assertEq(uint256(offering.currentPhase()), uint256(KiranaOffering.Phase.CANCELLED));
        assertEq(offering.totalRefundLiability(), 0);
    }

    function testCancelDuringCommitRefundsThreeBiddersInAnyOrder() public {
        _commitOnly(a, 10_000 * USDC, bytes32("ca"));
        _commitOnly(b, 20_000 * USDC, bytes32("cb"));
        _commitOnly(c, 30_000 * USDC, bytes32("cc"));
        vm.prank(admin);
        offering.cancel();
        assertEq(offering.totalRefundLiability(), 60_000 * USDC);
        address[3] memory order = [c, b, a];
        for (uint256 i; i < order.length; ++i) {
            vm.prank(order[i]);
            offering.claimRefund();
            assertGe(usdc.balanceOf(address(offering)), offering.totalRefundLiability());
        }
        assertEq(offering.totalRefundLiability(), 0);
        assertEq(usdc.balanceOf(address(offering)), 0);
    }

    function testCancelDuringRevealRefundsRevealedAndUnrevealed() public {
        _commitOnly(a, 10_000 * USDC, bytes32("ra"));
        _commitOnly(b, 20_000 * USDC, bytes32("rb"));
        vm.warp(offering.commitEnd());
        vm.prank(a);
        offering.revealBid(uint128(10_000 * USDC), uint64(4_000_000 * USDC), bytes32("ra"));
        assertEq(uint256(offering.currentPhase()), uint256(KiranaOffering.Phase.REVEAL));
        vm.prank(admin);
        offering.cancel();
        vm.prank(b);
        offering.claimRefund();
        vm.prank(a);
        offering.claimRefund();
        assertEq(offering.totalRefundLiability(), 0);
        assertEq(usdc.balanceOf(address(offering)), 0);
        assertEq(kira.balanceOf(b), 0);
    }

    function testRegistryPauseBlocksRegistrarWritesButPreservesEligibility() public {
        vm.prank(admin);
        registry.pause();
        assertTrue(registry.isEligible(a));
        vm.prank(admin);
        vm.expectRevert();
        registry.setEligible(a, false);
        vm.prank(admin);
        registry.unpause();
        vm.prank(admin);
        registry.setEligible(a, false);
        assertFalse(registry.isEligible(a));
    }

    function testSettlementOf64MarginalBidsStaysWithinGasCeiling() public {
        address[] memory ordered = _prepareMaximumMarginalTierFixture();

        vm.warp(offering.revealEnd());
        uint256 gasBefore = gasleft();
        offering.settle(ordered);
        uint256 settleGas = gasBefore - gasleft();

        emit log_named_uint("settle(64) gas", settleGas);
        assertLe(settleGas, MAX_SETTLE_GAS);
        assertTrue(offering.successful());
        assertEq(offering.clearingFdv(), MAXIMUM_SETTLEMENT_FDV);
        for (uint256 i; i < ordered.length; ++i) {
            assertEq(offering.revealedBidders(i), ordered[i]);
            assertEq(offering.acceptedOf(ordered[i]), MAXIMUM_SETTLEMENT_REGULAR_BID);
        }
        assertEq(offering.acceptedTotal(), MAXIMUM_SETTLEMENT_CAPACITY);
        assertEq(offering.totalCommitted(), MAXIMUM_SETTLEMENT_CAPACITY + 1);
        assertEq(offering.totalRefundLiability(), 1);
        assertEq(offering.acceptedTotal() + offering.totalRefundLiability(), offering.totalCommitted());
        assertGe(usdc.balanceOf(address(offering)), offering.totalRefundLiability() + offering.issuerProceeds());
    }

    function testRevealBidLimitRejectsSixtyFifthBid() public {
        address[] memory ordered = _prepareMaximumMarginalTierFixture();
        address sixtyFifth = address(uint160(MAXIMUM_SETTLEMENT_BIDDER_COUNT + 1));
        uint128 amount = uint128(MAXIMUM_SETTLEMENT_REGULAR_BID);
        bytes32 nonce = bytes32(MAXIMUM_SETTLEMENT_BIDDER_COUNT + 1);

        vm.startPrank(admin);
        registry.setEligible(sixtyFifth, true);
        usdc.mint(sixtyFifth, amount);
        vm.stopPrank();
        vm.prank(sixtyFifth);
        usdc.approve(address(offering), type(uint256).max);
        vm.warp(offering.commitStart());
        bytes32 commitment = offering.commitmentFor(sixtyFifth, amount, MAXIMUM_SETTLEMENT_FDV, nonce);
        vm.prank(sixtyFifth);
        offering.commitBid(commitment, amount);

        vm.warp(offering.commitEnd());
        for (uint256 i; i < ordered.length; ++i) {
            assertEq(offering.revealedBidders(i), ordered[i]);
        }
        vm.prank(sixtyFifth);
        vm.expectRevert(KiranaOffering.BidLimit.selector);
        offering.revealBid(amount, uint64(MAXIMUM_SETTLEMENT_FDV), nonce);
        assertEq(offering.revealedBidders(MAXIMUM_SETTLEMENT_BIDDER_COUNT - 1), ordered[ordered.length - 1]);
    }

    function _commitAndReveal(address bidder, uint256 amount, uint256 fdv, bytes32 nonce) internal {
        uint128 amount128 = uint128(amount);
        uint64 fdv64 = uint64(fdv);
        vm.warp(offering.commitStart());
        bytes32 commitment = offering.commitmentFor(bidder, amount128, fdv64, nonce);
        vm.prank(bidder);
        offering.commitBid(commitment, amount128);
        vm.warp(offering.commitEnd());
        vm.prank(bidder);
        offering.revealBid(amount128, fdv64, nonce);
    }

    function _commitOnly(address bidder, uint256 amount, bytes32 nonce) internal {
        vm.warp(offering.commitStart());
        bytes32 commitment = offering.commitmentFor(bidder, amount, 4_000_000 * USDC, nonce);
        vm.prank(bidder);
        offering.commitBid(commitment, uint128(amount));
    }

    function _settleMicroDustFixture() internal returns (address refundableBidder) {
        _commitAndReveal(a, 479_999_999_999, 5_000_000 * USDC, bytes32("micro-a"));
        _commitAndReveal(b, 1, 4_800_000 * USDC, bytes32("micro-b"));
        _commitAndReveal(c, 1, 4_800_000 * USDC, bytes32("micro-c"));
        vm.warp(offering.revealEnd());
        address[] memory ordered = new address[](3);
        ordered[0] = a;
        if (uint160(b) < uint160(c)) {
            ordered[1] = b;
            ordered[2] = c;
        } else {
            ordered[1] = c;
            ordered[2] = b;
        }
        offering.settle(ordered);
        assertEq(offering.acceptedOf(ordered[1]), 1);
        assertEq(offering.acceptedOf(ordered[2]), 0);
        refundableBidder = ordered[2];
    }

    function _prepareMaximumMarginalTierFixture() internal returns (address[] memory ordered) {
        ordered = new address[](MAXIMUM_SETTLEMENT_BIDDER_COUNT);
        vm.warp(offering.commitStart());
        for (uint256 i; i < ordered.length; ++i) {
            address bidder = address(uint160(i + 1));
            uint128 amount = uint128(MAXIMUM_SETTLEMENT_REGULAR_BID + (i + 1 == ordered.length ? 1 : 0));
            bytes32 nonce = bytes32(i + 1);
            ordered[i] = bidder;
            vm.startPrank(admin);
            registry.setEligible(bidder, true);
            usdc.mint(bidder, amount);
            vm.stopPrank();
            vm.prank(bidder);
            usdc.approve(address(offering), type(uint256).max);
            bytes32 commitment = offering.commitmentFor(bidder, amount, MAXIMUM_SETTLEMENT_FDV, nonce);
            vm.prank(bidder);
            offering.commitBid(commitment, amount);
        }
        vm.warp(offering.commitEnd());
        for (uint256 i; i < ordered.length; ++i) {
            uint128 amount = uint128(MAXIMUM_SETTLEMENT_REGULAR_BID + (i + 1 == ordered.length ? 1 : 0));
            vm.prank(ordered[i]);
            offering.revealBid(amount, uint64(MAXIMUM_SETTLEMENT_FDV), bytes32(i + 1));
        }
    }
}
