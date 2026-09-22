// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Valueless test currency. Not Circle USDC; never deploy on a live-money chain.
contract DemoUSDC is ERC20 {
    uint256 public constant FAUCET_AMOUNT = 250_000 * 1e6;
    uint256 public constant COOLDOWN = 1 days;
    mapping(address account => uint256 timestamp) public nextClaimAt;

    error TestnetOnly();
    error FaucetCooldown(uint256 availableAt);
    event FaucetClaimed(address indexed account, uint256 amount, uint256 nextClaimAt);

    constructor() ERC20("SAMA Demo USD - No Monetary Value", "demoUSDC") {
        if (block.chainid != 421614 && block.chainid != 31337) revert TestnetOnly();
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function claim() external {
        if (block.timestamp < nextClaimAt[msg.sender]) revert FaucetCooldown(nextClaimAt[msg.sender]);
        nextClaimAt[msg.sender] = block.timestamp + COOLDOWN;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT, nextClaimAt[msg.sender]);
    }
}
