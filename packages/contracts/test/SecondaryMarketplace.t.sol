// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Test} from "forge-std/Test.sol";
import {EligibilityRegistry} from "../src/EligibilityRegistry.sol";
import {EquityLinkedToken} from "../src/EquityLinkedToken.sol";
import {SecondaryMarketplace} from "../src/SecondaryMarketplace.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract SecondaryMarketplaceTest is Test {
    uint128 internal constant KIRA = uint128(1 ether);
    address internal admin = makeAddr("admin");
    address internal seller = makeAddr("seller");
    address internal buyer = makeAddr("buyer");
    address internal buyerTwo = makeAddr("buyer-two");
    address internal recipient = makeAddr("recipient");
    address internal stranger = makeAddr("stranger");
    EligibilityRegistry internal registry;
    EquityLinkedToken internal kira;
    MockUSDC internal usdc;
    SecondaryMarketplace internal market;

    function setUp() public {
        vm.startPrank(admin);
        registry = new EligibilityRegistry(admin);
        kira = new EquityLinkedToken(admin, address(registry), 1_000_000 ether);
        usdc = new MockUSDC();
        market = new SecondaryMarketplace(admin, address(usdc), address(kira), address(registry));
        registry.setEligible(seller, true);
        registry.setEligible(buyer, true);
        registry.setEligible(buyerTwo, true);
        registry.setEligible(recipient, true);
        registry.setEligible(address(market), true);
        kira.grantRole(kira.MINTER_ROLE(), admin);
        kira.mint(seller, 1_000 ether);
        vm.stopPrank();
        usdc.mint(buyer, type(uint128).max);
        usdc.mint(buyerTwo, type(uint128).max);
        vm.prank(seller);
        kira.approve(address(market), type(uint256).max);
        vm.prank(buyer);
        usdc.approve(address(market), type(uint256).max);
        vm.prank(buyerTwo);
        usdc.approve(address(market), type(uint256).max);
    }

    function testFullPurchaseMovesExactAssetsAndClosesEscrow() public {
        uint256 id = _create(100 * KIRA, 500_000_000);
        uint256 sellerUsdcBefore = usdc.balanceOf(seller);
        uint256 buyerKiraBefore = kira.balanceOf(buyer);

        vm.prank(buyer);
        market.buy(id, 100 ether, 500_000_000);

        _assertListing(id, 100 * KIRA, 500_000_000, 0, 0, SecondaryMarketplace.ListingStatus.FILLED);
        assertEq(kira.balanceOf(buyer), buyerKiraBefore + 100 ether);
        assertEq(usdc.balanceOf(seller), sellerUsdcBefore + 500_000_000);
        assertEq(market.outstandingKiraEscrow(), 0);
        assertEq(kira.balanceOf(address(market)), 0);
        assertEq(usdc.balanceOf(address(market)), 0);
    }

    function testPartialPurchasesUseQuotesAndConserveTotals() public {
        uint256 id = _create(100 * KIRA, 500_000_000);
        _buy(buyer, id, 30 ether, 150_000_000);
        _assertListing(id, 100 * KIRA, 500_000_000, 70 ether, 350_000_000, SecondaryMarketplace.ListingStatus.ACTIVE);
        assertEq(market.outstandingKiraEscrow(), 70 ether);
        _buy(buyerTwo, id, 20 ether, 100_000_000);
        _assertListing(id, 100 * KIRA, 500_000_000, 50 ether, 250_000_000, SecondaryMarketplace.ListingStatus.ACTIVE);
        _buy(buyer, id, 50 ether, 250_000_000);
        _assertListing(id, 100 * KIRA, 500_000_000, 0, 0, SecondaryMarketplace.ListingStatus.FILLED);
        assertEq(kira.balanceOf(buyer) + kira.balanceOf(buyerTwo), 100 ether);
        assertEq(usdc.balanceOf(seller), 500_000_000);
        assertEq(market.outstandingKiraEscrow(), 0);
    }

    function testTwoBuyersCanFillInDifferentOrders() public {
        uint256 first = _create(100 * KIRA, 500_000_000);
        _buy(buyer, first, 40 ether, 200_000_000);
        _buy(buyerTwo, first, 60 ether, 300_000_000);
        uint256 second = _create(100 * KIRA, 500_000_000);
        _buy(buyerTwo, second, 40 ether, 200_000_000);
        _buy(buyer, second, 60 ether, 300_000_000);
        _assertListing(first, 100 * KIRA, 500_000_000, 0, 0, SecondaryMarketplace.ListingStatus.FILLED);
        _assertListing(second, 100 * KIRA, 500_000_000, 0, 0, SecondaryMarketplace.ListingStatus.FILLED);
        assertEq(usdc.balanceOf(seller), 1_000_000_000);
        assertEq(market.outstandingKiraEscrow(), 0);
    }

    function testPartialFillThenCancellationReturnsExactRemainder() public {
        uint256 id = _create(100 * KIRA, 500_000_000);
        _buy(buyer, id, 30 ether, 150_000_000);
        uint256 recipientBefore = kira.balanceOf(recipient);
        vm.prank(seller);
        market.cancelListing(id, recipient);
        _assertListing(id, 100 * KIRA, 500_000_000, 0, 0, SecondaryMarketplace.ListingStatus.CANCELLED);
        assertEq(kira.balanceOf(buyer), 30 ether);
        assertEq(kira.balanceOf(recipient), recipientBefore + 70 ether);
        assertEq(usdc.balanceOf(seller), 150_000_000);
        assertEq(market.outstandingKiraEscrow(), 0);
    }

    function testQuoteCeilingAndUnpricedRemainderBoundary() public {
        uint256 id = _create(3, 2);
        assertEq(market.quotePurchase(id, 1), 1);
        _buy(buyer, id, 1, 1);
        vm.expectRevert(SecondaryMarketplace.UnpricedRemainder.selector);
        market.quotePurchase(id, 1);
        _buy(buyerTwo, id, 2, 1);
        _assertListing(id, 3, 2, 0, 0, SecondaryMarketplace.ListingStatus.FILLED);
        assertEq(usdc.balanceOf(seller), 2);
    }

    function testRejectsZeroOverfillAndMaximumCostWithoutStateChange() public {
        vm.prank(seller);
        vm.expectRevert(SecondaryMarketplace.InvalidAmount.selector);
        market.createListing(0, 1);
        vm.prank(seller);
        vm.expectRevert(SecondaryMarketplace.InvalidAmount.selector);
        market.createListing(1, 0);
        uint256 id = _create(100 * KIRA, 500_000_000);
        vm.expectRevert(SecondaryMarketplace.InvalidAmount.selector);
        market.quotePurchase(id, 0);
        vm.expectRevert(SecondaryMarketplace.InvalidAmount.selector);
        market.quotePurchase(id, 101 ether);
        vm.prank(buyer);
        vm.expectRevert(SecondaryMarketplace.InvalidAmount.selector);
        market.buy(id, 0, 0);
        vm.prank(buyer);
        vm.expectRevert(SecondaryMarketplace.PriceExceedsMaximum.selector);
        market.buy(id, 10 ether, 49_999_999);
        _assertListing(id, 100 * KIRA, 500_000_000, 100 * KIRA, 500_000_000, SecondaryMarketplace.ListingStatus.ACTIVE);
        assertEq(market.outstandingKiraEscrow(), 100 ether);
    }

    function testEligibilityAndAlternateRecipientCancellation() public {
        vm.prank(stranger);
        vm.expectRevert(SecondaryMarketplace.NotEligible.selector);
        market.createListing(1, 1);
        uint256 id = _create(100 * KIRA, 500_000_000);
        vm.prank(stranger);
        vm.expectRevert(SecondaryMarketplace.NotEligible.selector);
        market.buy(id, 1 ether, type(uint128).max);
        vm.prank(seller);
        vm.expectRevert(SecondaryMarketplace.InvalidRecipient.selector);
        market.cancelListing(id, address(0));
        vm.prank(seller);
        vm.expectRevert(SecondaryMarketplace.InvalidRecipient.selector);
        market.cancelListing(id, stranger);
        vm.prank(admin);
        registry.setEligible(seller, false);
        vm.prank(seller);
        market.cancelListing(id, recipient);
        assertEq(kira.balanceOf(recipient), 100 ether);
        assertEq(market.outstandingKiraEscrow(), 0);
    }

    function testUnauthorizedCancellationPreservesAllBalancesAndEscrow() public {
        uint256 id = _create(100 * KIRA, 500_000_000);
        (
            address storedSeller,
            uint128 originalAmount,
            uint128 originalPrice,
            uint128 remainingAmount,
            uint128 remainingPrice,
            SecondaryMarketplace.ListingStatus status
        ) = market.listings(id);
        uint256 outstandingBefore = market.outstandingKiraEscrow();
        uint256 marketKiraBefore = kira.balanceOf(address(market));
        uint256 sellerKiraBefore = kira.balanceOf(seller);
        uint256 recipientKiraBefore = kira.balanceOf(recipient);

        vm.prank(stranger);
        vm.expectRevert(SecondaryMarketplace.NotSeller.selector);
        market.cancelListing(id, recipient);

        _assertListing(id, originalAmount, originalPrice, remainingAmount, remainingPrice, status);
        assertEq(storedSeller, seller);
        assertEq(market.outstandingKiraEscrow(), outstandingBefore);
        assertEq(kira.balanceOf(address(market)), marketKiraBefore);
        assertEq(kira.balanceOf(seller), sellerKiraBefore);
        assertEq(kira.balanceOf(recipient), recipientKiraBefore);
    }

    function testPauseRegistryPauseAndKiraPausePreserveEscapePath() public {
        uint256 id = _create(100 * KIRA, 500_000_000);
        vm.prank(admin);
        market.pause();
        vm.prank(seller);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        market.createListing(1, 1);
        vm.prank(buyer);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        market.buy(id, 1 ether, type(uint128).max);
        vm.prank(admin);
        registry.pause();
        vm.prank(seller);
        market.cancelListing(id, seller);
        assertEq(kira.balanceOf(seller), 1_000 ether);

        vm.prank(admin);
        registry.unpause();
        vm.prank(admin);
        market.unpause();
        id = _create(100 * KIRA, 500_000_000);
        vm.prank(admin);
        kira.pause();
        vm.prank(buyer);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        market.buy(id, 1 ether, type(uint128).max);
        _assertListing(id, 100 * KIRA, 500_000_000, 100 * KIRA, 500_000_000, SecondaryMarketplace.ListingStatus.ACTIVE);
        vm.prank(admin);
        kira.unpause();
        _buy(buyer, id, 100 ether, 500_000_000);
    }

    function testKiraPauseRollsBackCreateBuyAndCancellation() public {
        uint256 nextIdBefore = market.nextListingId();
        uint256 sellerKiraBefore = kira.balanceOf(seller);
        vm.prank(admin);
        kira.pause();
        vm.prank(seller);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        market.createListing(100 * KIRA, 500_000_000);
        assertEq(market.nextListingId(), nextIdBefore);
        assertEq(market.outstandingKiraEscrow(), 0);
        assertEq(kira.balanceOf(seller), sellerKiraBefore);

        vm.prank(admin);
        kira.unpause();
        uint256 id = _create(100 * KIRA, 500_000_000);
        uint256 escrowBefore = market.outstandingKiraEscrow();
        uint256 marketKiraBefore = kira.balanceOf(address(market));
        uint256 buyerKiraBefore = kira.balanceOf(buyer);
        uint256 sellerUsdcBefore = usdc.balanceOf(seller);

        vm.prank(admin);
        kira.pause();
        vm.prank(buyer);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        market.buy(id, 10 ether, 50_000_000);
        _assertListing(id, 100 * KIRA, 500_000_000, 100 * KIRA, 500_000_000, SecondaryMarketplace.ListingStatus.ACTIVE);
        assertEq(market.outstandingKiraEscrow(), escrowBefore);
        assertEq(kira.balanceOf(address(market)), marketKiraBefore);
        assertEq(kira.balanceOf(buyer), buyerKiraBefore);
        assertEq(usdc.balanceOf(seller), sellerUsdcBefore);

        vm.prank(seller);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        market.cancelListing(id, recipient);
        _assertListing(id, 100 * KIRA, 500_000_000, 100 * KIRA, 500_000_000, SecondaryMarketplace.ListingStatus.ACTIVE);
        assertEq(market.outstandingKiraEscrow(), escrowBefore);
        assertEq(kira.balanceOf(address(market)), marketKiraBefore);
        assertEq(kira.balanceOf(recipient), 0);

        vm.prank(admin);
        kira.unpause();
        vm.prank(seller);
        market.cancelListing(id, recipient);
        _assertListing(id, 100 * KIRA, 500_000_000, 0, 0, SecondaryMarketplace.ListingStatus.CANCELLED);
        assertEq(market.outstandingKiraEscrow(), 0);
        assertEq(kira.balanceOf(address(market)), 0);
        assertEq(kira.balanceOf(recipient), 100 * KIRA);
    }

    function testTerminalListingsRejectRepeatedTransitions() public {
        uint256 filled = _create(10 * KIRA, 10);
        _buy(buyer, filled, 10 ether, 10);
        vm.prank(buyer);
        vm.expectRevert(SecondaryMarketplace.InactiveListing.selector);
        market.buy(filled, 1, 10);
        vm.prank(seller);
        vm.expectRevert(SecondaryMarketplace.InactiveListing.selector);
        market.cancelListing(filled, seller);

        uint256 cancelled = _create(10 * KIRA, 10);
        vm.prank(seller);
        market.cancelListing(cancelled, seller);
        uint256 sellerKiraBefore = kira.balanceOf(seller);
        uint256 marketKiraBefore = kira.balanceOf(address(market));
        uint256 escrowBefore = market.outstandingKiraEscrow();
        vm.prank(buyer);
        vm.expectRevert(SecondaryMarketplace.InactiveListing.selector);
        market.buy(cancelled, 1, 10);
        vm.prank(seller);
        vm.expectRevert(SecondaryMarketplace.InactiveListing.selector);
        market.cancelListing(cancelled, seller);
        _assertListing(cancelled, 10 * KIRA, 10, 0, 0, SecondaryMarketplace.ListingStatus.CANCELLED);
        assertEq(kira.balanceOf(seller), sellerKiraBefore);
        assertEq(kira.balanceOf(address(market)), marketKiraBefore);
        assertEq(market.outstandingKiraEscrow(), escrowBefore);
    }

    function testListingEventsReconstructPartialLifecycle() public {
        vm.expectEmit(true, true, false, true, address(market));
        emit SecondaryMarketplace.ListingCreated(1, seller, 100 * KIRA, 500_000_000);
        uint256 id = _create(100 * KIRA, 500_000_000);

        vm.expectEmit(true, true, false, true, address(market));
        emit SecondaryMarketplace.ListingPurchased(id, buyer, 30 ether, 150_000_000, 70 ether, 350_000_000);
        _buy(buyer, id, 30 ether, 150_000_000);

        vm.expectEmit(true, true, true, true, address(market));
        emit SecondaryMarketplace.ListingCancelled(id, seller, recipient, 70 ether, 350_000_000);
        vm.prank(seller);
        market.cancelListing(id, recipient);
    }

    function _create(uint128 amount, uint128 price) internal returns (uint256 id) {
        vm.prank(seller);
        id = market.createListing(amount, price);
    }

    function _buy(address account, uint256 id, uint128 amount, uint128 maxCost) internal {
        assertEq(market.quotePurchase(id, amount), maxCost);
        vm.prank(account);
        market.buy(id, amount, maxCost);
    }

    function _assertListing(
        uint256 id,
        uint128 originalAmount,
        uint128 originalPrice,
        uint128 remainingAmount,
        uint128 remainingPrice,
        SecondaryMarketplace.ListingStatus status
    ) internal view {
        (
            address listingSeller,
            uint128 storedOriginalAmount,
            uint128 storedOriginalPrice,
            uint128 storedRemainingAmount,
            uint128 storedRemainingPrice,
            SecondaryMarketplace.ListingStatus storedStatus
        ) = market.listings(id);
        assertEq(listingSeller, seller);
        assertEq(storedOriginalAmount, originalAmount);
        assertEq(storedOriginalPrice, originalPrice);
        assertEq(storedRemainingAmount, remainingAmount);
        assertEq(storedRemainingPrice, remainingPrice);
        assertEq(uint8(storedStatus), uint8(status));
    }
}
