// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IKira {
    function mint(address to, uint256 amount) external;
}

interface IEligibilityRegistry {
    function isEligible(address account) external view returns (bool);
}

contract KiranaOffering is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    uint256 public constant USDC_SCALE = 1e6;
    uint256 public constant BPS = 10_000;
    uint256 public constant MAX_BIDS = 64;
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant CANCELLER_ROLE = keccak256("CANCELLER_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    enum Phase {
        SCHEDULED,
        COMMIT,
        REVEAL,
        SETTLED_SUCCESS,
        SETTLED_FAILED,
        CANCELLED
    }

    struct Bid {
        bytes32 commitment;
        uint128 amount;
        uint64 maxFdv;
        uint128 accepted;
        uint128 refund;
        bool revealed;
        bool tokenClaimed;
        bool refundClaimed;
    }

    IERC20 public immutable usdc;
    IKira public immutable kira;
    IEligibilityRegistry public immutable eligibility;
    uint64 public immutable commitStart;
    uint64 public immutable commitEnd;
    uint64 public immutable revealEnd;
    uint128 public immutable floorFdv;
    uint128 public immutable ceilingFdv;
    uint128 public immutable minimumRaise;
    uint128 public immutable offeredSupply;
    uint16 public immutable offeredAllocationBps;

    mapping(address bidder => Bid) public bids;
    address[] public revealedBidders;
    bool public finalized;
    bool public successful;
    uint256 public clearingFdv;
    uint256 public acceptedTotal;
    uint256 public totalCommitted;
    uint256 public totalTokenAllocated;
    uint256 public totalRefundLiability;
    uint256 public issuerProceeds;
    bool public issuerWithdrawn;

    error InvalidSchedule();
    error InvalidTerms();
    error WrongPhase();
    error NotEligible();
    error InvalidCommitment();
    error ExistingBid();
    error BadReveal();
    error InvalidFdv();
    error BidLimit();
    error InvalidBidderList();
    error NotFinalized();
    error AlreadyClaimed();
    error NothingToClaim();
    error NotSuccessful();
    error AlreadyWithdrawn();
    event BidCommitted(address indexed bidder, bytes32 indexed commitment, uint256 amount);
    event BidRevealed(address indexed bidder, uint256 amount, uint256 maxFdv);
    event Settled(bool successful, uint256 clearingFdv, uint256 acceptedTotal);
    event TokensClaimed(address indexed bidder, uint256 amount);
    event RefundClaimed(address indexed bidder, uint256 amount);
    event IssuerProceedsWithdrawn(address indexed issuer, uint256 amount);
    event Cancelled();

    constructor(
        address admin,
        address usdc_,
        address kira_,
        address registry_,
        uint64 commitStart_,
        uint64 commitEnd_,
        uint64 revealEnd_
    ) {
        if (commitStart_ >= commitEnd_ || commitEnd_ >= revealEnd_) revert InvalidSchedule();
        usdc = IERC20(usdc_);
        kira = IKira(kira_);
        eligibility = IEligibilityRegistry(registry_);
        commitStart = commitStart_;
        commitEnd = commitEnd_;
        revealEnd = revealEnd_;
        floorFdv = uint128(4_000_000 * USDC_SCALE);
        ceilingFdv = uint128(6_000_000 * USDC_SCALE);
        minimumRaise = uint128(400_000 * USDC_SCALE);
        offeredSupply = 1_000_000 ether;
        offeredAllocationBps = 1_000;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(CANCELLER_ROLE, admin);
        _grantRole(ISSUER_ROLE, admin);
    }

    function phase() public view returns (Phase) {
        if (finalized) return successful ? Phase.SETTLED_SUCCESS : Phase.SETTLED_FAILED;
        if (cancelled) return Phase.CANCELLED;
        if (block.timestamp < commitStart) return Phase.SCHEDULED;
        if (block.timestamp < commitEnd) return Phase.COMMIT;
        return Phase.REVEAL;
    }
    bool public cancelled;

    function currentPhase() public view returns (Phase) {
        if (cancelled) return Phase.CANCELLED;
        return phase();
    }

    function commitmentFor(address bidder, uint256 amount, uint256 maxFdv, bytes32 nonce)
        public
        view
        returns (bytes32)
    {
        return keccak256(abi.encode(block.chainid, address(this), bidder, amount, maxFdv, nonce));
    }

    function commitBid(bytes32 commitment, uint128 amount) external whenNotPaused nonReentrant {
        if (currentPhase() != Phase.COMMIT) revert WrongPhase();
        if (!eligibility.isEligible(msg.sender)) revert NotEligible();
        if (commitment == bytes32(0) || amount == 0) revert InvalidCommitment();
        if (bids[msg.sender].commitment != bytes32(0)) revert ExistingBid();
        bids[msg.sender].commitment = commitment;
        bids[msg.sender].amount = amount;
        totalCommitted += amount;
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        emit BidCommitted(msg.sender, commitment, amount);
    }

    function revealBid(uint128 amount, uint64 maxFdv, bytes32 nonce) external whenNotPaused {
        if (currentPhase() != Phase.REVEAL || block.timestamp >= revealEnd) revert WrongPhase();
        Bid storage bid = bids[msg.sender];
        if (
            bid.commitment == bytes32(0) || bid.revealed || amount != bid.amount
                || commitmentFor(msg.sender, amount, maxFdv, nonce) != bid.commitment
        ) revert BadReveal();
        if (maxFdv < floorFdv || maxFdv > ceilingFdv) revert InvalidFdv();
        if (revealedBidders.length == MAX_BIDS) revert BidLimit();
        bid.revealed = true;
        bid.maxFdv = maxFdv;
        revealedBidders.push(msg.sender);
        emit BidRevealed(msg.sender, amount, maxFdv);
    }

    function settle(address[] calldata ordered) external whenNotPaused {
        if (cancelled || finalized || block.timestamp < revealEnd) revert WrongPhase();
        _verifyOrdered(ordered);
        uint256 candidate;
        bool floorFallback;
        uint256 demand;
        for (uint256 i; i < ordered.length; ++i) {
            Bid storage b = bids[ordered[i]];
            demand += b.amount;
            if (i + 1 == ordered.length || b.maxFdv != bids[ordered[i + 1]].maxFdv) {
                if (demand >= uint256(b.maxFdv) * offeredAllocationBps / BPS) {
                    candidate = b.maxFdv;
                    break;
                }
            }
        }
        if (candidate == 0) {
            if (demand < minimumRaise) {
                finalized = true;
                _setRefunds(ordered, 0, 0);
                totalRefundLiability = totalCommitted;
                emit Settled(false, 0, 0);
                return;
            }
            candidate = floorFdv;
            floorFallback = true;
        }
        uint256 capacity = candidate * offeredAllocationBps / BPS;
        uint256 above;
        uint256 atTier;
        for (uint256 i; i < ordered.length; ++i) {
            Bid storage b = bids[ordered[i]];
            if (!floorFallback && b.maxFdv > candidate) above += b.amount;
            else if (floorFallback || b.maxFdv == candidate) atTier += b.amount;
        }
        uint256 remaining = capacity - above;
        uint256 allocated;
        for (uint256 i; i < ordered.length; ++i) {
            Bid storage b = bids[ordered[i]];
            uint256 accepted = !floorFallback && b.maxFdv > candidate
                ? b.amount
                : ((floorFallback || b.maxFdv == candidate) ? uint256(b.amount) * remaining / atTier : 0);
            allocated += accepted;
            _setBidAccounting(ordered[i], accepted);
        }
        uint256 dust = capacity - allocated;
        for (uint256 i; dust != 0 && i < ordered.length; ++i) {
            Bid storage b = bids[ordered[i]];
            if (floorFallback || b.maxFdv == candidate) {
                if (b.accepted < b.amount) {
                    b.accepted += 1;
                    b.refund -= 1;
                    allocated += 1;
                    --dust;
                }
            }
        }
        finalized = true;
        successful = true;
        clearingFdv = candidate;
        if (allocated != capacity) revert InvalidBidderList();
        acceptedTotal = allocated;
        issuerProceeds = acceptedTotal;
        totalRefundLiability = totalCommitted - acceptedTotal;
        emit Settled(true, candidate, acceptedTotal);
    }

    function _verifyOrdered(address[] calldata ordered) internal view {
        if (ordered.length != revealedBidders.length || ordered.length > MAX_BIDS) revert InvalidBidderList();
        for (uint256 i; i < ordered.length; ++i) {
            Bid storage b = bids[ordered[i]];
            if (
                !b.revealed
                    || (i > 0
                        && (bids[ordered[i - 1]].maxFdv < b.maxFdv
                            || (bids[ordered[i - 1]].maxFdv == b.maxFdv
                                && uint160(ordered[i - 1]) >= uint160(ordered[i]))))
            ) revert InvalidBidderList();
        }
    }

    function _setRefunds(address[] calldata ordered, uint256, uint256) internal {
        for (uint256 i; i < ordered.length; ++i) {
            _setBidAccounting(ordered[i], 0);
        }
    }

    function _setBidAccounting(address bidder, uint256 accepted) internal {
        Bid storage b = bids[bidder];
        uint256 refund = uint256(b.amount) - accepted;
        b.accepted = uint128(accepted);
        b.refund = uint128(refund);
        totalRefundLiability += refund;
    }

    function refundable(address bidder) public view returns (uint256) {
        Bid storage b = bids[bidder];
        if (!finalized || b.refundClaimed) return 0;
        if (!successful || !b.revealed) return b.amount;
        return b.refund;
    }

    function acceptedOf(address bidder) public view returns (uint256) {
        Bid storage b = bids[bidder];
        return b.accepted;
    }

    function tokenAllocation(address bidder) public view returns (uint256) {
        return acceptedOf(bidder) * offeredSupply / acceptedTotal;
    }

    function claimTokens() external nonReentrant {
        if (!successful) revert NotSuccessful();
        Bid storage b = bids[msg.sender];
        if (b.tokenClaimed) revert AlreadyClaimed();
        uint256 amount = tokenAllocation(msg.sender);
        if (amount == 0) revert NothingToClaim();
        b.tokenClaimed = true;
        totalTokenAllocated += amount;
        kira.mint(msg.sender, amount);
        emit TokensClaimed(msg.sender, amount);
    }

    function claimRefund() external nonReentrant {
        if (!finalized && !cancelled) revert NotFinalized();
        Bid storage b = bids[msg.sender];
        if (b.refundClaimed) revert AlreadyClaimed();
        uint256 amount = cancelled ? b.amount : refundable(msg.sender);
        if (amount == 0) revert NothingToClaim();
        b.refundClaimed = true;
        totalRefundLiability -= amount;
        usdc.safeTransfer(msg.sender, amount);
        emit RefundClaimed(msg.sender, amount);
    }

    function withdrawIssuerProceeds() external onlyRole(ISSUER_ROLE) nonReentrant {
        if (!successful) revert NotSuccessful();
        if (issuerWithdrawn) revert AlreadyWithdrawn();
        issuerWithdrawn = true;
        usdc.safeTransfer(msg.sender, issuerProceeds);
        emit IssuerProceedsWithdrawn(msg.sender, issuerProceeds);
    }

    function cancel() external onlyRole(CANCELLER_ROLE) {
        if (finalized || cancelled) revert WrongPhase();
        cancelled = true;
        emit Cancelled();
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
