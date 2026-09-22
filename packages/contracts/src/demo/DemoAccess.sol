// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {EligibilityRegistry} from "../EligibilityRegistry.sol";

/// @notice Open enrollment for the public simulation, not identity or compliance verification.
contract DemoAccess {
    EligibilityRegistry public immutable registry;
    error TestnetOnly();
    error InvalidRegistry();
    error AlreadyEnrolled();

    constructor(EligibilityRegistry registry_) {
        if (block.chainid != 421614 && block.chainid != 31337) revert TestnetOnly();
        if (address(registry_) == address(0)) revert InvalidRegistry();
        registry = registry_;
    }

    function join() external {
        if (registry.isEligible(msg.sender)) revert AlreadyEnrolled();
        registry.setEligible(msg.sender, true);
    }
}
