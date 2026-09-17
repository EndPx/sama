// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {EligibilityRegistry} from "../src/EligibilityRegistry.sol";
import {EquityLinkedToken} from "../src/EquityLinkedToken.sol";
import {SecondaryMarketplace} from "../src/SecondaryMarketplace.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

abstract contract MarketplacePropertyBase is Test {
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
}

contract MarketplaceSplitFuzzTest is MarketplacePropertyBase {
    function testFuzzSplitPurchasesConserveKiraAndUsdc(uint8 rawUnits, uint8 rawFirst, uint8 rawSecond) public {
        uint128 units = uint128(bound(rawUnits, 3, 32));
        uint128 originalAmount = units * uint128(1 ether);
        // Matching base-unit price and amount keeps every generated partial fill valid.
        uint128 originalPrice = originalAmount;
        uint256 id = _create(originalAmount, originalPrice);

        uint128 first = uint128(bound(rawFirst, 1, units - 2)) * uint128(1 ether);
        _buy(buyerOne, id, first);

        (,,, uint128 remainingAfterFirst, uint128 priceAfterFirst,) = market.listings(id);
        uint128 remainingUnits = remainingAfterFirst / uint128(1 ether);
        uint128 second = uint128(bound(rawSecond, 1, remainingUnits - 1)) * uint128(1 ether);
        _buy(buyerTwo, id, second);

        (,,, uint128 remainingAmount,,) = market.listings(id);
        _buy(buyerOne, id, remainingAmount);

        (,,, uint128 finalAmount, uint128 finalPrice, SecondaryMarketplace.ListingStatus status) = market.listings(id);
        assertGt(remainingAfterFirst, 0);
        assertGt(priceAfterFirst, 0);
        assertEq(finalAmount, 0);
        assertEq(finalPrice, 0);
        assertEq(uint8(status), uint8(SecondaryMarketplace.ListingStatus.FILLED));
        assertEq(kira.balanceOf(buyerOne) + kira.balanceOf(buyerTwo), originalAmount);
        assertEq(usdc.balanceOf(seller), originalPrice);
        assertEq(market.outstandingKiraEscrow(), 0);
    }

    function _buy(address account, uint256 id, uint128 amount) internal {
        uint256 cost = market.quotePurchase(id, amount);
        vm.prank(account);
        market.buy(id, amount, uint128(cost));
    }
}

contract MarketplaceHandler {
    Vm internal constant VM = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    SecondaryMarketplace internal immutable MARKET;
    MockUSDC internal immutable USDC;
    EquityLinkedToken internal immutable KIRA;
    uint256 internal immutable LISTING_ID;
    address internal immutable SELLER;
    address[2] internal buyers;
    uint256 public paidUsdc;
    uint256 public soldKira;
    uint256 public cancelledKira;
    uint256 public abandonedPrice;

    // Ghost totals are updated only after a valid transfer, allowing conservation checks across random orders.
    constructor(
        SecondaryMarketplace market_,
        MockUSDC usdc_,
        EquityLinkedToken kira_,
        uint256 listingId_,
        address seller_,
        address buyerOne_,
        address buyerTwo_
    ) {
        MARKET = market_;
        USDC = usdc_;
        KIRA = kira_;
        LISTING_ID = listingId_;
        SELLER = seller_;
        buyers[0] = buyerOne_;
        buyers[1] = buyerTwo_;
    }

    function buyValidChunk(uint256 seed) external {
        (,,, uint128 remainingAmount,, SecondaryMarketplace.ListingStatus status) = MARKET.listings(LISTING_ID);
        if (status != SecondaryMarketplace.ListingStatus.ACTIVE) return;
        uint128 amount = remainingAmount > 20 ether ? 20 ether : remainingAmount;
        uint256 cost = MARKET.quotePurchase(LISTING_ID, amount);
        VM.prank(buyers[seed % 2]);
        MARKET.buy(LISTING_ID, amount, uint128(cost));
        soldKira += amount;
        paidUsdc += cost;
    }

    function cancelActiveRemainder() external {
        (,,, uint128 remainingAmount, uint128 remainingPrice, SecondaryMarketplace.ListingStatus status) =
            MARKET.listings(LISTING_ID);
        if (status != SecondaryMarketplace.ListingStatus.ACTIVE) return;
        VM.prank(SELLER);
        MARKET.cancelListing(LISTING_ID, SELLER);
        cancelledKira += remainingAmount;
        abandonedPrice += remainingPrice;
    }
}

contract MarketplaceAccountingInvariantTest is MarketplacePropertyBase {
    uint128 internal constant ORIGINAL_AMOUNT = 100 ether;
    uint128 internal constant ORIGINAL_PRICE = 500_000_000;
    uint256 internal constant SELLER_BASE_KIRA = 900 ether;
    uint256 internal listingId;
    MarketplaceHandler internal handler;

    function setUp() public override {
        super.setUp();
        listingId = _create(ORIGINAL_AMOUNT, ORIGINAL_PRICE);
        handler = new MarketplaceHandler(market, usdc, kira, listingId, seller, buyerOne, buyerTwo);
        bytes4[] memory selectors = new bytes4[](2);
        selectors[0] = MarketplaceHandler.buyValidChunk.selector;
        selectors[1] = MarketplaceHandler.cancelActiveRemainder.selector;
        targetContract(address(handler));
        targetSelector(FuzzSelector({addr: address(handler), selectors: selectors}));
    }

    function invariant_marketplaceEscrowMatchesActiveRemainder() public view {
        (,,, uint128 remainingAmount, uint128 remainingPrice, SecondaryMarketplace.ListingStatus status) =
            market.listings(listingId);
        uint256 expectedEscrow = status == SecondaryMarketplace.ListingStatus.ACTIVE ? remainingAmount : 0;
        assertEq(market.outstandingKiraEscrow(), expectedEscrow);
        assertEq(kira.balanceOf(address(market)), expectedEscrow);
        assertEq(usdc.balanceOf(address(market)), 0);
        if (status != SecondaryMarketplace.ListingStatus.ACTIVE) {
            assertEq(remainingAmount, 0);
            assertEq(remainingPrice, 0);
        }
    }

    function invariant_listingConservesKiraAndUsdc() public view {
        (,,, uint128 remainingAmount, uint128 remainingPrice,) = market.listings(listingId);
        assertEq(handler.soldKira() + handler.cancelledKira() + remainingAmount, ORIGINAL_AMOUNT);
        assertEq(handler.paidUsdc() + handler.abandonedPrice() + remainingPrice, ORIGINAL_PRICE);
        assertEq(
            kira.balanceOf(buyerOne) + kira.balanceOf(buyerTwo) + kira.balanceOf(seller)
                + kira.balanceOf(address(market)),
            SELLER_BASE_KIRA + ORIGINAL_AMOUNT
        );
        assertEq(usdc.balanceOf(seller), handler.paidUsdc());
    }
}
