// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {DemoUSDC} from "../src/demo/DemoUSDC.sol";

contract DemoCurrencyHandler is Test {
    DemoUSDC public immutable currency;
    address[3] public actors = [address(0xA11CE), address(0xB0B), address(0xCA11)];
    uint256 public minted;

    constructor(DemoUSDC currency_) {
        currency = currency_;
    }

    function claimIfReady(uint8 seed) public {
        address actor = actors[seed % 3];
        if (block.timestamp < currency.nextClaimAt(actor)) return;
        vm.prank(actor);
        currency.claim();
        minted += 250_000 * 1e6;
    }

    function transferAvailable(uint8 seed, uint256 amountSeed) public {
        address from = actors[seed % 3];
        address to = actors[(uint256(seed) + 1) % 3];
        uint256 amount = bound(amountSeed, 0, currency.balanceOf(from));
        vm.prank(from);
        currency.transfer(to, amount);
    }

    function advanceDay() public {
        vm.warp(block.timestamp + 1 days);
    }
}

contract DemoCurrencyPropertyTest is StdInvariant, Test {
    DemoUSDC private currency;
    DemoCurrencyHandler private handler;

    function setUp() public {
        vm.chainId(31337);
        currency = new DemoUSDC();
        handler = new DemoCurrencyHandler(currency);
        bytes4[] memory selectors = new bytes4[](3);
        selectors[0] = handler.claimIfReady.selector;
        selectors[1] = handler.transferAvailable.selector;
        selectors[2] = handler.advanceDay.selector;
        targetSelector(FuzzSelector({addr: address(handler), selectors: selectors}));
        targetContract(address(handler));
    }

    function invariant_demoCurrencyConservesEveryMintAndTransfer() public view {
        uint256 balances;
        for (uint256 i; i < 3; ++i) {
            balances += currency.balanceOf(handler.actors(i));
        }
        assertEq(balances, currency.totalSupply());
        assertEq(currency.totalSupply(), handler.minted());
        assertEq(currency.balanceOf(address(handler)), 0);
    }

    function testFuzzTransferPreservesMintedUnits(uint256 amountSeed) public {
        currency.claim();
        uint256 amount = bound(amountSeed, 0, currency.FAUCET_AMOUNT());
        currency.transfer(address(0xBEEF), amount);
        assertEq(currency.balanceOf(address(this)) + currency.balanceOf(address(0xBEEF)), currency.totalSupply());
    }
}
