// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {EligibilityRegistry} from "../src/EligibilityRegistry.sol";
import {EquityLinkedToken} from "../src/EquityLinkedToken.sol";
import {SecondaryMarketplace} from "../src/SecondaryMarketplace.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract SecondaryMarketplaceTest is Test {
    address internal admin = makeAddr("admin");
    address internal seller = makeAddr("seller");
    address internal buyer = makeAddr("buyer");
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
        registry.setEligible(address(market), true);
        kira.grantRole(kira.MINTER_ROLE(), admin);
        kira.mint(seller, 100 ether);
        vm.stopPrank();
        usdc.mint(buyer, 1_000_000_000);
        vm.prank(seller);
        kira.approve(address(market), type(uint256).max);
        vm.prank(buyer);
        usdc.approve(address(market), type(uint256).max);
    }

    function testPauseStillAllowsCancellationAndRegistryPauseDoesNotStrandKira() public {
        vm.prank(seller);
        uint256 id = market.createListing(100 ether, 500_000_000);
        vm.prank(admin);
        market.pause();
        vm.prank(admin);
        registry.pause();
        vm.prank(seller);
        market.cancelListing(id);
        assertEq(kira.balanceOf(seller), 100 ether);
        assertEq(kira.balanceOf(address(market)), 0);
        assertEq(usdc.balanceOf(address(market)), 0);
    }

    function testPauseBlocksCreateAndBuyButNotOwnershipExit() public {
        vm.prank(seller);
        uint256 id = market.createListing(50 ether, 100_000_000);
        vm.prank(admin);
        market.pause();
        vm.prank(seller);
        vm.expectRevert();
        market.createListing(1 ether, 1);
        vm.prank(buyer);
        vm.expectRevert();
        market.buy(id);
        vm.prank(seller);
        market.cancelListing(id);
    }

    function testPurchaseIsAtomicAndNoAssetsRemainEscrowed() public {
        vm.prank(seller);
        uint256 id = market.createListing(100 ether, 500_000_000);
        uint256 sellerBefore = usdc.balanceOf(seller);
        vm.prank(buyer);
        market.buy(id);
        assertEq(kira.balanceOf(buyer), 100 ether);
        assertEq(usdc.balanceOf(seller), sellerBefore + 500_000_000);
        assertEq(kira.balanceOf(address(market)), 0);
        assertEq(usdc.balanceOf(address(market)), 0);
        vm.prank(seller);
        vm.expectRevert(SecondaryMarketplace.InactiveListing.selector);
        market.cancelListing(id);
    }

    function testUnauthorizedCancelAndIneligibleBuyerRevert() public {
        vm.prank(seller);
        uint256 id = market.createListing(100 ether, 500_000_000);
        vm.prank(stranger);
        vm.expectRevert(SecondaryMarketplace.NotSeller.selector);
        market.cancelListing(id);
        vm.prank(stranger);
        vm.expectRevert(SecondaryMarketplace.NotEligible.selector);
        market.buy(id);
    }
}
