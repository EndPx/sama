// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Executable acceptance criteria for the locked auction specification.
/// Production contracts are introduced only after this fixture and its edge cases exist.
contract AuctionEconomicsSpecification {
    uint256 internal constant USDC = 1e6;

    function testReferenceTermsAreLocked() external pure {
        require(1_000_000 * 1e18 == 1_000_000e18, "offered supply");
        require(4_800_000 * USDC / 10 == 480_000 * USDC, "clearing cost");
        require(480_000 * USDC * 1e18 / 1_000_000e18 == 480_000, "price precision");
    }

    function testReferenceExpectedAcceptancesAreConservative() external pure {
        uint256 accepted = (150_000 + 200_000 + 100_000 + 30_000) * USDC;
        uint256 committed = (150_000 + 200_000 + 100_000 + 150_000 + 100_000) * USDC;
        require(accepted == 480_000 * USDC, "accepted");
        require(committed - accepted == 220_000 * USDC, "refunds");
    }
}
