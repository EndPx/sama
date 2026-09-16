// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

interface IEligibility {
    function isEligible(address account) external view returns (bool);
}

/// @notice Capped, restricted testnet demo token. It represents no legal/economic right.
contract EquityLinkedToken is ERC20, ERC20Capped, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    IEligibility public immutable eligibility;
    error IneligibleEndpoint();

    constructor(address admin, address registry, uint256 cap_) ERC20("Kirana AI Demo Token", "KIRA") ERC20Capped(cap_) {
        eligibility = IEligibility(registry);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) whenNotPaused {
        if (from != address(0) && to != address(0) && (!eligibility.isEligible(from) || !eligibility.isEligible(to))) {
            revert IneligibleEndpoint();
        }
        super._update(from, to, value);
    }
}
