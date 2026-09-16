// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {EligibilityRegistry} from "../src/EligibilityRegistry.sol";
import {EquityLinkedToken} from "../src/EquityLinkedToken.sol";
import {KiranaOffering} from "../src/KiranaOffering.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract KiranaOfferingTest is Test {
    uint256 internal constant USDC = 1e6;
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
}
