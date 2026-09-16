// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

interface IEligibilityCheck {
    function isEligible(address account) external view returns (bool);
}

contract SecondaryMarketplace is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    struct Listing {
        address seller;
        uint128 amount;
        uint128 priceUsdc;
        bool active;
    }
    IERC20 public immutable usdc;
    IERC20 public immutable kira;
    IEligibilityCheck public immutable eligibility;
    uint256 public nextListingId;
    mapping(uint256 id => Listing) public listings;
    error NotEligible();
    error InvalidAmount();
    error NotSeller();
    error InactiveListing();
    event ListingCreated(uint256 indexed id, address indexed seller, uint256 amount, uint256 priceUsdc);
    event ListingCancelled(uint256 indexed id);
    event ListingPurchased(uint256 indexed id, address indexed buyer);

    constructor(address admin, address usdc_, address kira_, address registry_) {
        usdc = IERC20(usdc_);
        kira = IERC20(kira_);
        eligibility = IEligibilityCheck(registry_);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function createListing(uint128 amount, uint128 priceUsdc) external whenNotPaused nonReentrant returns (uint256 id) {
        if (!eligibility.isEligible(msg.sender)) revert NotEligible();
        if (amount == 0 || priceUsdc == 0) revert InvalidAmount();
        id = ++nextListingId;
        listings[id] = Listing(msg.sender, amount, priceUsdc, true);
        kira.safeTransferFrom(msg.sender, address(this), amount);
        emit ListingCreated(id, msg.sender, amount, priceUsdc);
    }

    function cancelListing(uint256 id) external nonReentrant {
        Listing storage l = listings[id];
        if (!l.active) revert InactiveListing();
        if (l.seller != msg.sender) revert NotSeller();
        l.active = false;
        kira.safeTransfer(l.seller, l.amount);
        emit ListingCancelled(id);
    }

    function buy(uint256 id) external whenNotPaused nonReentrant {
        Listing storage l = listings[id];
        if (!l.active) revert InactiveListing();
        if (!eligibility.isEligible(msg.sender)) revert NotEligible();
        l.active = false;
        usdc.safeTransferFrom(msg.sender, l.seller, l.priceUsdc);
        kira.safeTransfer(msg.sender, l.amount);
        emit ListingPurchased(id, msg.sender);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
