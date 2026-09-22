// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {EligibilityRegistry} from "../src/EligibilityRegistry.sol";
import {EquityLinkedToken} from "../src/EquityLinkedToken.sol";
import {KiranaOffering} from "../src/KiranaOffering.sol";
import {SecondaryMarketplace} from "../src/SecondaryMarketplace.sol";
import {DemoUSDC} from "../src/demo/DemoUSDC.sol";
import {DemoAccess} from "../src/demo/DemoAccess.sol";

contract Deploy is Script {
    struct Deployment {
        address admin;
        address currency;
        address registry;
        address kira;
        address offering;
        address market;
        address access;
        uint64 start;
        uint64 end;
        uint64 reveal;
    }

    error ZeroDeployer();
    error ScheduleOutOfRange();
    error InvalidSchedule();

    function run() external {
        require(block.chainid == 421614 || block.chainid == 31337, "Testnet only");
        address admin = vm.envAddress("DEPLOYER_ADDRESS");
        (uint64 start, uint64 end, uint64 reveal) = _schedule(admin);
        vm.startBroadcast(admin);
        DemoUSDC currency = new DemoUSDC();
        EligibilityRegistry registry = new EligibilityRegistry(admin);
        EquityLinkedToken kira = new EquityLinkedToken(admin, address(registry), 1_000_000 ether);
        KiranaOffering offering =
            new KiranaOffering(admin, address(currency), address(kira), address(registry), start, end, reveal);
        SecondaryMarketplace market =
            new SecondaryMarketplace(admin, address(currency), address(kira), address(registry));
        DemoAccess access = new DemoAccess(registry);
        registry.grantRole(registry.REGISTRAR_ROLE(), address(access));
        registry.setEligible(address(market), true);
        registry.setEligible(admin, true);
        kira.grantRole(kira.MINTER_ROLE(), address(offering));
        vm.stopBroadcast();
        Deployment memory deployment;
        deployment.admin = admin;
        deployment.currency = address(currency);
        deployment.registry = address(registry);
        deployment.kira = address(kira);
        deployment.offering = address(offering);
        deployment.market = address(market);
        deployment.access = address(access);
        deployment.start = start;
        deployment.end = end;
        deployment.reveal = reveal;
        _writeManifest(deployment);
        console2.log("Currency", address(currency));
        console2.log("Registry", address(registry));
        console2.log("KIRA", address(kira));
        console2.log("Offering", address(offering));
        console2.log("Marketplace", address(market));
        console2.log("Demo access", address(access));
    }

    function _schedule(address admin) internal returns (uint64 start, uint64 end, uint64 reveal) {
        uint256 startValue = vm.envOr("COMMIT_START", block.timestamp);
        uint256 endValue = vm.envOr("COMMIT_END", block.timestamp + 7 days);
        uint256 revealValue = vm.envOr("REVEAL_END", block.timestamp + 8 days);
        return validate(admin, startValue, endValue, revealValue);
    }

    function validate(address admin, uint256 startValue, uint256 endValue, uint256 revealValue)
        public
        pure
        returns (uint64 start, uint64 end, uint64 reveal)
    {
        if (admin == address(0)) revert ZeroDeployer();
        if (startValue > type(uint64).max || endValue > type(uint64).max || revealValue > type(uint64).max) {
            revert ScheduleOutOfRange();
        }
        if (startValue >= endValue || endValue >= revealValue) revert InvalidSchedule();
        return (uint64(startValue), uint64(endValue), uint64(revealValue));
    }

    function _writeManifest(Deployment memory deployment) internal {
        string memory key = "deployment";
        vm.serializeUint(key, "chainId", block.chainid);
        vm.serializeAddress(key, "admin", deployment.admin);
        vm.serializeAddress(key, "currency", deployment.currency);
        vm.serializeAddress(key, "registry", deployment.registry);
        vm.serializeAddress(key, "kira", deployment.kira);
        vm.serializeAddress(key, "offering", deployment.offering);
        vm.serializeAddress(key, "marketplace", deployment.market);
        vm.serializeAddress(key, "demoAccess", deployment.access);
        vm.serializeUint(key, "commitStart", deployment.start);
        vm.serializeUint(key, "commitEnd", deployment.end);
        string memory json = vm.serializeUint(key, "revealEnd", deployment.reveal);
        vm.createDir("deployments", true);
        vm.writeJson(json, string.concat("deployments/", vm.toString(block.chainid), ".json"));
    }
}
