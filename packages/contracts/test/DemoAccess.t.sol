// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {DemoUSDC} from "../src/demo/DemoUSDC.sol";
import {DemoAccess} from "../src/demo/DemoAccess.sol";
import {EligibilityRegistry} from "../src/EligibilityRegistry.sol";

contract DemoAccessTest is Test {
    DemoUSDC private currency;
    DemoAccess private access;
    EligibilityRegistry private registry;
    address private alice = address(0xA11CE);
    address private bob = address(0xB0B);

    function setUp() public {
        vm.chainId(31337);
        registry = new EligibilityRegistry(address(this));
        currency = new DemoUSDC();
        access = new DemoAccess(registry);
        registry.grantRole(registry.REGISTRAR_ROLE(), address(access));
    }

    function testFaucetCooldownAndTransfersConserveSupply() public {
        vm.prank(alice);
        currency.claim();
        assertEq(currency.decimals(), 6);
        assertEq(currency.totalSupply(), currency.FAUCET_AMOUNT());
        assertEq(currency.balanceOf(alice), currency.FAUCET_AMOUNT());
        uint256 next = currency.nextClaimAt(alice);
        vm.expectRevert(abi.encodeWithSelector(DemoUSDC.FaucetCooldown.selector, next));
        vm.prank(alice);
        currency.claim();
        vm.prank(alice);
        currency.transfer(bob, 10e6);
        assertEq(currency.balanceOf(alice) + currency.balanceOf(bob), currency.totalSupply());
        vm.warp(next);
        vm.prank(alice);
        currency.claim();
        assertEq(currency.totalSupply(), 2 * currency.FAUCET_AMOUNT());
    }

    function testEnrollmentOnlyChangesCallerAndRespectsRegistrarControls() public {
        vm.prank(alice);
        access.join();
        assertTrue(registry.isEligible(alice));
        assertFalse(registry.isEligible(bob));
        vm.expectRevert(DemoAccess.AlreadyEnrolled.selector);
        vm.prank(alice);
        access.join();
        registry.pause();
        vm.expectRevert();
        vm.prank(bob);
        access.join();
        assertFalse(registry.isEligible(bob));
        registry.unpause();
        registry.revokeRole(registry.REGISTRAR_ROLE(), address(access));
        vm.expectRevert();
        vm.prank(bob);
        access.join();
        assertFalse(registry.isEligible(bob));
    }

    function testHelpersRejectMainnetDeployment() public {
        vm.chainId(42161);
        vm.expectRevert(DemoUSDC.TestnetOnly.selector);
        new DemoUSDC();
        vm.expectRevert(DemoAccess.TestnetOnly.selector);
        new DemoAccess(registry);
        vm.chainId(421614);
        DemoUSDC sepoliaCurrency = new DemoUSDC();
        assertEq(sepoliaCurrency.decimals(), 6);
        vm.expectRevert(DemoAccess.InvalidRegistry.selector);
        new DemoAccess(EligibilityRegistry(address(0)));
    }
}
