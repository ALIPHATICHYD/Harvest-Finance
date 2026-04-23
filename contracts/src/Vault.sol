// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Vault
 * @dev A simple ERC4626-like vault for depositing and withdrawing tokens
 * with share-based accounting.
 */
contract Vault is ERC20, Ownable, ReentrancyGuard {
    IERC20 public asset;
    
    uint256 public totalAssets_;
    
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, uint256 assets, uint256 shares);

    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        asset = _asset;
    }

    /**
     * @dev Deposit assets and receive shares
     * @param assets Amount of underlying assets to deposit
     * @param receiver Address to receive the shares
     * @return shares Amount of shares minted
     */
    function deposit(uint256 assets, address receiver) external nonReentrant returns (uint256 shares) {
        require(receiver != address(0), "Invalid receiver");
        require(assets > 0, "Assets must be greater than 0");

        shares = convertToShares(assets);
        
        // Transfer assets from caller to vault
        require(asset.transferFrom(msg.sender, address(this), assets), "Transfer failed");
        
        // Mint shares
        _mint(receiver, shares);
        
        totalAssets_ += assets;
        
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /**
     * @dev Withdraw assets by burning shares
     * @param assets Amount of underlying assets to withdraw
     * @param receiver Address to receive the assets
     * @param owner Address of the share owner
     * @return shares Amount of shares burned
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) external nonReentrant returns (uint256 shares) {
        require(receiver != address(0), "Invalid receiver");
        require(assets > 0, "Assets must be greater than 0");

        shares = convertToShares(assets);
        
        // Check allowance if caller is not owner
        if (msg.sender != owner) {
            uint256 allowed = allowance(owner, msg.sender);
            require(allowed >= shares, "Insufficient allowance");
            _approve(owner, msg.sender, allowed - shares);
        }

        // Burn shares
        _burn(owner, shares);
        
        // Transfer assets to receiver
        require(asset.transfer(receiver, assets), "Transfer failed");
        
        totalAssets_ -= assets;
        
        emit Withdraw(msg.sender, receiver, assets, shares);
    }

    /**
     * @dev Redeem shares for assets
     * @param shares Amount of shares to redeem
     * @param receiver Address to receive the assets
     * @param owner Address of the share owner
     * @return assets Amount of underlying assets received
     */
    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) external nonReentrant returns (uint256 assets) {
        require(receiver != address(0), "Invalid receiver");
        require(shares > 0, "Shares must be greater than 0");

        assets = convertToAssets(shares);
        
        // Check allowance if caller is not owner
        if (msg.sender != owner) {
            uint256 allowed = allowance(owner, msg.sender);
            require(allowed >= shares, "Insufficient allowance");
            _approve(owner, msg.sender, allowed - shares);
        }

        // Burn shares
        _burn(owner, shares);
        
        // Transfer assets to receiver
        require(asset.transfer(receiver, assets), "Transfer failed");
        
        totalAssets_ -= assets;
        
        emit Withdraw(msg.sender, receiver, assets, shares);
    }

    /**
     * @dev Convert assets to shares
     */
    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            return assets;
        }
        return (assets * supply) / totalAssets_;
    }

    /**
     * @dev Convert shares to assets
     */
    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) {
            return shares;
        }
        return (shares * totalAssets_) / supply;
    }

    /**
     * @dev Get total assets in the vault
     */
    function totalAssets() public view returns (uint256) {
        return totalAssets_;
    }

    /**
     * @dev Preview deposit shares
     */
    function previewDeposit(uint256 assets) external view returns (uint256) {
        return convertToShares(assets);
    }

    /**
     * @dev Preview withdraw shares
     */
    function previewWithdraw(uint256 assets) external view returns (uint256) {
        return convertToShares(assets);
    }

    /**
     * @dev Preview redeem assets
     */
    function previewRedeem(uint256 shares) external view returns (uint256) {
        return convertToAssets(shares);
    }

    /**
     * @dev Emergency function to rescue tokens
     */
    function emergencyWithdraw(address token) external onlyOwner {
        IERC20 tokenToWithdraw = IERC20(token);
        uint256 balance = tokenToWithdraw.balanceOf(address(this));
        require(tokenToWithdraw.transfer(msg.sender, balance), "Transfer failed");
    }
}
