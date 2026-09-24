// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {EligibilityRegistry} from "../src/EligibilityRegistry.sol";
import {EquityLinkedToken} from "../src/EquityLinkedToken.sol";
import {SecondaryMarketplace} from "../src/SecondaryMarketplace.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

abstract contract MarketplacePropertyBase is Test {
    uint128 internal constant KIRA = uint128(1 ether);
    address internal admin = makeAddr("market-property-admin");
    address internal seller = makeAddr("market-property-seller");
    address internal buyerOne = makeAddr("market-property-buyer-one");
    address internal buyerTwo = makeAddr("market-property-buyer-two");
    EligibilityRegistry internal registry;
    EquityLinkedToken internal kira;
    MockUSDC internal usdc;
    SecondaryMarketplace internal market;

    function setUp() public virtual {
        vm.startPrank(admin);
        registry = new EligibilityRegistry(admin);
        kira = new EquityLinkedToken(admin, address(registry), 1_000_000 ether);
        usdc = new MockUSDC();
        market = new SecondaryMarketplace(admin, address(usdc), address(kira), address(registry));
        registry.setEligible(seller, true);
        registry.setEligible(buyerOne, true);
        registry.setEligible(buyerTwo, true);
        registry.setEligible(address(market), true);
        kira.grantRole(kira.MINTER_ROLE(), admin);
        kira.mint(seller, 1_000 ether);
        vm.stopPrank();
        usdc.mint(buyerOne, type(uint128).max);
        usdc.mint(buyerTwo, type(uint128).max);
        vm.prank(seller);
        kira.approve(address(market), type(uint256).max);
        vm.prank(buyerOne);
        usdc.approve(address(market), type(uint256).max);
        vm.prank(buyerTwo);
        usdc.approve(address(market), type(uint256).max);
    }

    function _create(uint128 amount, uint128 price) internal returns (uint256 id) {
        vm.prank(seller);
        id = market.createListing(amount, price);
    }

    /// @dev Independent integer ceiling division used by the property model, not by the marketplace.
    function _ceilQuote(uint256 price, uint256 amount, uint256 totalAmount) internal pure returns (uint256) {
        uint256 quotient = price * amount / totalAmount;
        return quotient + (price * amount % totalAmount == 0 ? 0 : 1);
    }
}

contract MarketplaceSplitFuzzTest is MarketplacePropertyBase {
    uint128 internal constant MAX_PRICE_USDC_BASE_UNITS = 1_000_000_000_000;

    function testFuzzSplitPurchasesConserveKiraAndUsdc(uint8 rawUnits, uint128 rawPrice) public {
        uint128 units = uint128(bound(rawUnits, 3, 32));
        uint128 originalAmount = units * KIRA;
        uint128 originalPrice = uint128(bound(rawPrice, units, MAX_PRICE_USDC_BASE_UNITS));
        uint256 id = _create(originalAmount, originalPrice);
        uint256 remainingAmount = originalAmount;
        uint256 remainingPrice = originalPrice;
        uint256 sellerUsdcBefore = usdc.balanceOf(seller);
        uint256 buyerOneKiraBefore = kira.balanceOf(buyerOne);
        uint256 buyerTwoKiraBefore = kira.balanceOf(buyerTwo);

        // Two non-final whole-token fills exercise price rounding before the final exact fill.
        _purchaseAndAssert(buyerOne, id, KIRA, remainingAmount, remainingPrice);
        uint256 firstCost = _ceilQuote(remainingPrice, KIRA, remainingAmount);
        remainingAmount -= KIRA;
        remainingPrice -= firstCost;
        _assertRemaining(id, remainingAmount, remainingPrice, SecondaryMarketplace.ListingStatus.ACTIVE);
        assertGt(remainingAmount, 0);
        assertGt(remainingPrice, 0);

        _purchaseAndAssert(buyerTwo, id, KIRA, remainingAmount, remainingPrice);
        uint256 secondCost = _ceilQuote(remainingPrice, KIRA, remainingAmount);
        remainingAmount -= KIRA;
        remainingPrice -= secondCost;
        _assertRemaining(id, remainingAmount, remainingPrice, SecondaryMarketplace.ListingStatus.ACTIVE);
        assertGt(remainingAmount, 0);
        assertGt(remainingPrice, 0);

        _purchaseAndAssert(buyerOne, id, uint128(remainingAmount), remainingAmount, remainingPrice);
        _assertRemaining(id, 0, 0, SecondaryMarketplace.ListingStatus.FILLED);
        assertEq(usdc.balanceOf(seller) - sellerUsdcBefore, originalPrice);
        assertEq(
            kira.balanceOf(buyerOne) - buyerOneKiraBefore + kira.balanceOf(buyerTwo) - buyerTwoKiraBefore,
            originalAmount
        );
        assertEq(market.outstandingKiraEscrow(), 0);
        assertEq(kira.balanceOf(address(market)), 0);
    }

    function _purchaseAndAssert(
        address account,
        uint256 id,
        uint128 amount,
        uint256 modeledRemainingAmount,
        uint256 modeledRemainingPrice
    ) internal {
        uint256 expectedCost = amount == modeledRemainingAmount
            ? modeledRemainingPrice
            : _ceilQuote(modeledRemainingPrice, amount, modeledRemainingAmount);
        assertEq(market.quotePurchase(id, amount), expectedCost);
        vm.prank(account);
        market.buy(id, amount, uint128(expectedCost));
    }

    function _assertRemaining(
        uint256 id,
        uint256 amount,
        uint256 price,
        SecondaryMarketplace.ListingStatus expectedStatus
    ) internal view {
        (,,, uint128 onchainAmount, uint128 onchainPrice, SecondaryMarketplace.ListingStatus status) =
            market.listings(id);
        assertEq(onchainAmount, amount);
        assertEq(onchainPrice, price);
        assertEq(uint8(status), uint8(expectedStatus));
    }
}

contract MarketplaceHandler {
    Vm internal constant VM = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    uint256 internal constant LISTING_COUNT = 3;
    SecondaryMarketplace internal immutable MARKET;
    MockUSDC internal immutable USDC;
    EquityLinkedToken internal immutable KIRA;
    address internal immutable SELLER;
    address[2] internal buyers;
    uint256[3] internal listingIds;
    uint256[3] internal originalAmounts;
    uint256[3] internal originalPrices;
    uint256[3] internal paidUsdc;
    uint256[3] internal soldKira;
    uint256[3] internal cancelledKira;
    uint256[3] internal abandonedPrice;
    uint256 public handlerReverts;

    // Ghost values are updated only after valid marketplace calls, so each listing can be reconstructed independently.
    constructor(
        SecondaryMarketplace market_,
        MockUSDC usdc_,
        EquityLinkedToken kira_,
        address seller_,
        address buyerOne_,
        address buyerTwo_,
        uint256[3] memory listingIds_,
        uint256[3] memory originalAmounts_,
        uint256[3] memory originalPrices_
    ) {
        MARKET = market_;
        USDC = usdc_;
        KIRA = kira_;
        SELLER = seller_;
        buyers[0] = buyerOne_;
        buyers[1] = buyerTwo_;
        listingIds = listingIds_;
        originalAmounts = originalAmounts_;
        originalPrices = originalPrices_;
    }

    function buyValidPartial(uint256 listingSeed, uint256 buyerSeed) external {
        uint256 index = listingSeed % LISTING_COUNT;
        (,,, uint128 remainingAmount,, SecondaryMarketplace.ListingStatus status) = MARKET.listings(listingIds[index]);
        if (status != SecondaryMarketplace.ListingStatus.ACTIVE || remainingAmount <= 10 ether) return;
        uint128 amount = 10 ether;
        uint256 cost = MARKET.quotePurchase(listingIds[index], amount);
        VM.prank(buyers[buyerSeed % buyers.length]);
        MARKET.buy(listingIds[index], amount, uint128(cost));
        soldKira[index] += amount;
        paidUsdc[index] += cost;
    }

    function buyValidFinal(uint256 listingSeed, uint256 buyerSeed) external {
        uint256 index = listingSeed % LISTING_COUNT;
        (,,, uint128 remainingAmount,, SecondaryMarketplace.ListingStatus status) = MARKET.listings(listingIds[index]);
        if (status != SecondaryMarketplace.ListingStatus.ACTIVE) return;
        uint256 cost = MARKET.quotePurchase(listingIds[index], remainingAmount);
        VM.prank(buyers[buyerSeed % buyers.length]);
        MARKET.buy(listingIds[index], remainingAmount, uint128(cost));
        soldKira[index] += remainingAmount;
        paidUsdc[index] += cost;
    }

    function cancelActiveRemainder(uint256 listingSeed) external {
        uint256 index = listingSeed % LISTING_COUNT;
        (,,, uint128 remainingAmount, uint128 remainingPrice, SecondaryMarketplace.ListingStatus status) =
            MARKET.listings(listingIds[index]);
        if (status != SecondaryMarketplace.ListingStatus.ACTIVE) return;
        VM.prank(SELLER);
        MARKET.cancelListing(listingIds[index], SELLER);
        cancelledKira[index] += remainingAmount;
        abandonedPrice[index] += remainingPrice;
    }

    function listingId(uint256 index) external view returns (uint256) {
        return listingIds[index];
    }

    function originalAmount(uint256 index) external view returns (uint256) {
        return originalAmounts[index];
    }

    function originalPrice(uint256 index) external view returns (uint256) {
        return originalPrices[index];
    }

    function paid(uint256 index) external view returns (uint256) {
        return paidUsdc[index];
    }

    function sold(uint256 index) external view returns (uint256) {
        return soldKira[index];
    }

    function cancelled(uint256 index) external view returns (uint256) {
        return cancelledKira[index];
    }

    function abandoned(uint256 index) external view returns (uint256) {
        return abandonedPrice[index];
    }
}

contract MarketplaceAccountingInvariantTest is MarketplacePropertyBase {
    uint256 internal constant LISTING_COUNT = 3;
    uint256 internal constant SELLER_STARTING_KIRA = 1_000 ether;
    MarketplaceHandler internal handler;

    function setUp() public override {
        super.setUp();
        uint256[3] memory listingIds;
        uint256[3] memory amounts = [uint256(100 ether), uint256(80 ether), uint256(60 ether)];
        uint256[3] memory prices = [uint256(500_000_000), uint256(400_000_000), uint256(300_000_000)];
        for (uint256 index; index < LISTING_COUNT; ++index) {
            listingIds[index] = _create(uint128(amounts[index]), uint128(prices[index]));
        }
        handler = new MarketplaceHandler(market, usdc, kira, seller, buyerOne, buyerTwo, listingIds, amounts, prices);
        bytes4[] memory selectors = new bytes4[](3);
        selectors[0] = MarketplaceHandler.buyValidPartial.selector;
        selectors[1] = MarketplaceHandler.buyValidFinal.selector;
        selectors[2] = MarketplaceHandler.cancelActiveRemainder.selector;
        targetContract(address(handler));
        targetSelector(FuzzSelector({addr: address(handler), selectors: selectors}));
    }

    function invariant_aggregateEscrowMatchesAllActiveListings() public view {
        uint256 activeEscrow;
        for (uint256 index; index < LISTING_COUNT; ++index) {
            (,,, uint128 remainingAmount,, SecondaryMarketplace.ListingStatus status) =
                market.listings(handler.listingId(index));
            if (status == SecondaryMarketplace.ListingStatus.ACTIVE) activeEscrow += remainingAmount;
        }
        assertEq(market.outstandingKiraEscrow(), activeEscrow);
        assertEq(kira.balanceOf(address(market)), activeEscrow);
        assertEq(usdc.balanceOf(address(market)), 0);
        assertEq(handler.handlerReverts(), 0);
    }

    function invariant_eachListingConservesAssetsAndTerminalState() public view {
        uint256 totalBuyerKira;
        for (uint256 index; index < LISTING_COUNT; ++index) {
            (,,, uint128 remainingAmount, uint128 remainingPrice, SecondaryMarketplace.ListingStatus status) =
                market.listings(handler.listingId(index));
            assertEq(handler.sold(index) + handler.cancelled(index) + remainingAmount, handler.originalAmount(index));
            assertEq(handler.paid(index) + handler.abandoned(index) + remainingPrice, handler.originalPrice(index));
            if (status != SecondaryMarketplace.ListingStatus.ACTIVE) {
                assertEq(remainingAmount, 0);
                assertEq(remainingPrice, 0);
            }
            totalBuyerKira += handler.sold(index);
        }
        assertEq(kira.balanceOf(buyerOne) + kira.balanceOf(buyerTwo), totalBuyerKira);
        assertEq(
            kira.balanceOf(seller) + kira.balanceOf(buyerOne) + kira.balanceOf(buyerTwo)
                + kira.balanceOf(address(market)),
            SELLER_STARTING_KIRA
        );
    }
}
