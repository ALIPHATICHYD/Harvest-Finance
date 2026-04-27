// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title IVault
/// @notice Interface for the Harvest Finance Vault contract
interface IVault {
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, uint256 assets, uint256 shares);

    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares);
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets);

    function convertToShares(uint256 assets) external view returns (uint256);
    function convertToAssets(uint256 shares) external view returns (uint256);
    function totalAssets() external view returns (uint256);

    function previewDeposit(uint256 assets) external view returns (uint256);
    function previewWithdraw(uint256 assets) external view returns (uint256);
    function previewRedeem(uint256 shares) external view returns (uint256);
}
