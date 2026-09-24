// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IEligibilityCheck {
    function isEligible(address account) external view returns (bool);
}

contract SecondaryMarketplace is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    enum ListingStatus {
        NONE,
        ACTIVE,
        FILLED,
        CANCELLED
    }

    struct Listing {
        address seller;
        uint128 originalAmount;
        uint128 originalPriceUsdc;
        uint128 remainingAmount;
        uint128 remainingPriceUsdc;
        ListingStatus status;
    }

    IERC20 public immutable usdc;
    IERC20 public immutable kira;
    IEligibilityCheck public immutable eligibility;
    uint256 public nextListingId;
    uint256 public outstandingKiraEscrow;
    mapping(uint256 id => Listing) public listings;

    error NotEligible();
    error InvalidAmount();
    error InvalidRecipient();
    error NotSeller();
    error InactiveListing();
    error PriceExceedsMaximum();
    error UnpricedRemainder();

    event ListingCreated(uint256 indexed id, address indexed seller, uint256 amount, uint256 priceUsdc);
    event ListingPurchased(
        uint256 indexed id,
        address indexed buyer,
        uint256 purchasedAmount,
        uint256 costUsdc,
        uint256 remainingAmount,
        uint256 remainingPriceUsdc
    );
    event ListingCancelled(
        uint256 indexed id,
        address indexed seller,
        address indexed recipient,
        uint256 returnedAmount,
        uint256 abandonedPriceUsdc
    );

    constructor(address admin, address usdc_, address kira_, address registry_) {
        usdc = IERC20(usdc_);
        kira = IERC20(kira_);
        eligibility = IEligibilityCheck(registry_);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function createListing(uint128 totalAmount, uint128 totalPriceUsdc)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 id)
    {
        if (!eligibility.isEligible(msg.sender)) revert NotEligible();
        if (totalAmount == 0 || totalPriceUsdc == 0) revert InvalidAmount();

        id = ++nextListingId;
        listings[id] = Listing({
            seller: msg.sender,
            originalAmount: totalAmount,
            originalPriceUsdc: totalPriceUsdc,
            remainingAmount: totalAmount,
            remainingPriceUsdc: totalPriceUsdc,
            status: ListingStatus.ACTIVE
        });
        outstandingKiraEscrow += totalAmount;

        kira.safeTransferFrom(msg.sender, address(this), totalAmount);
        emit ListingCreated(id, msg.sender, totalAmount, totalPriceUsdc);
    }

    function quotePurchase(uint256 id, uint128 purchaseAmount) public view returns (uint256 costUsdc) {
        Listing storage listing = listings[id];
        if (listing.status != ListingStatus.ACTIVE) revert InactiveListing();
        if (purchaseAmount == 0 || purchaseAmount > listing.remainingAmount) revert InvalidAmount();
        if (purchaseAmount == listing.remainingAmount) return listing.remainingPriceUsdc;

        costUsdc = Math.mulDiv(listing.remainingPriceUsdc, purchaseAmount, listing.remainingAmount, Math.Rounding.Ceil);
        if (costUsdc >= listing.remainingPriceUsdc) revert UnpricedRemainder();
    }

    function buy(uint256 id, uint128 purchaseAmount, uint128 maxCostUsdc) external whenNotPaused nonReentrant {
        Listing storage listing = listings[id];
        if (listing.status != ListingStatus.ACTIVE) revert InactiveListing();
        if (!eligibility.isEligible(msg.sender)) revert NotEligible();

        uint256 costUsdc = quotePurchase(id, purchaseAmount);
        if (costUsdc > maxCostUsdc) revert PriceExceedsMaximum();

        uint256 remainingAmount = listing.remainingAmount - purchaseAmount;
        uint256 remainingPriceUsdc = listing.remainingPriceUsdc - costUsdc;
        listing.remainingAmount = uint128(remainingAmount);
        listing.remainingPriceUsdc = uint128(remainingPriceUsdc);
        outstandingKiraEscrow -= purchaseAmount;
        if (remainingAmount == 0) listing.status = ListingStatus.FILLED;

        usdc.safeTransferFrom(msg.sender, listing.seller, costUsdc);
        kira.safeTransfer(msg.sender, purchaseAmount);
        emit ListingPurchased(id, msg.sender, purchaseAmount, costUsdc, remainingAmount, remainingPriceUsdc);
    }

    function cancelListing(uint256 id, address recipient) external nonReentrant {
        Listing storage listing = listings[id];
        if (listing.status != ListingStatus.ACTIVE) revert InactiveListing();
        if (listing.seller != msg.sender) revert NotSeller();
        if (recipient == address(0) || !eligibility.isEligible(recipient)) revert InvalidRecipient();

        uint256 returnedAmount = listing.remainingAmount;
        uint256 abandonedPriceUsdc = listing.remainingPriceUsdc;
        listing.remainingAmount = 0;
        listing.remainingPriceUsdc = 0;
        listing.status = ListingStatus.CANCELLED;
        outstandingKiraEscrow -= returnedAmount;

        kira.safeTransfer(recipient, returnedAmount);
        emit ListingCancelled(id, msg.sender, recipient, returnedAmount, abandonedPriceUsdc);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
