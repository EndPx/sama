// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @notice Testnet-only simulated eligibility registry; it is not KYC/AML.
contract EligibilityRegistry is AccessControl, Pausable {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    mapping(address account => bool) private _eligible;

    event EligibilityUpdated(address indexed account, bool eligible);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function setEligible(address account, bool eligible) external onlyRole(REGISTRAR_ROLE) {
        _eligible[account] = eligible;
        emit EligibilityUpdated(account, eligible);
    }

    function isEligible(address account) external view returns (bool) {
        return _eligible[account];
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
