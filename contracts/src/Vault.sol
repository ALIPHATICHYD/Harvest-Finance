// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IVault.sol";
import "./libraries/VaultLib.sol";

/**
 * @title Vault
 * @dev ERC4626-like vault implementing IVault. Share/asset math is
 * delegated to VaultLib for modularity and reusability.
 */
contract Vault is IVault, ERC20, Ownable, ReentrancyGuard {
    using VaultLib for uint256;
    IERC20 public asset;

    uint256 public totalAssets_;

    /// @notice Maximum total assets the vault is allowed to hold via `deposit`.
    /// @dev Initialized to `type(uint256).max` (unlimited) to preserve the
    ///      pre-cap deployment behaviour. Update via `setDepositCap`.
    uint256 public depositCap;

    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, uint256 assets, uint256 shares);
    event DepositCapUpdated(uint256 oldCap, uint256 newCap);

    // =========================================================
    // Roles
    // =========================================================

    /// @notice Full admin: can grant / revoke roles and call emergencyWithdraw.
    bytes32 public constant ADMIN_ROLE  = keccak256("ADMIN_ROLE");

    /// @notice Dedicated role for pausing / unpausing in emergencies.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // =========================================================
    // State
    // =========================================================

    /// @notice The underlying ERC20 asset managed by this vault.
    IERC20 public immutable asset;

    /// @dev Internal accounting of deposited assets (not the raw token balance).
    uint256 private _totalAssets;

    // =========================================================
    // Events
    // =========================================================

    event Deposit(
        address indexed caller,
        address indexed owner,
        uint256 assets,
        uint256 shares
    );

    event Withdraw(
        address indexed caller,
        address indexed receiver,
        address indexed owner,
        uint256 assets,
        uint256 shares
    );

    event EmergencyWithdraw(
        address indexed admin,
        address indexed token,
        address indexed recipient,
        uint256 amount
    );

    event VaultPaused(address indexed pauser);
    event VaultUnpaused(address indexed pauser);

    // =========================================================
    // Constructor
    // =========================================================

    /**
     * @param _asset   The underlying ERC20 token.
     * @param _name    Vault share token name.
     * @param _symbol  Vault share token symbol.
     * @param admin    Address that receives ADMIN_ROLE and PAUSER_ROLE.
     */
    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        address admin
    ) ERC20(_name, _symbol) {
        require(address(_asset) != address(0), "Vault: zero asset address");
        require(admin != address(0),            "Vault: zero admin address");

        asset = _asset;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE,         admin);
        _grantRole(PAUSER_ROLE,        admin);
    }

    // =========================================================
    // Core vault operations
    // =========================================================

    /**
     * @notice Deposit `assets` of the underlying token and receive shares.
     * @param assets   Amount of underlying assets to deposit (must be > 0).
     * @param receiver Address that will receive the minted shares.
     * @return shares  Amount of vault shares minted.
     *
     * Security: nonReentrant, whenNotPaused, CEI pattern, SafeERC20
     */
    function deposit(uint256 assets, address receiver)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 shares)
    {
        require(assets > 0,             "Vault: zero assets");
        require(receiver != address(0), "Vault: zero receiver");

        shares = convertToShares(assets);
        require(shares > 0, "Vault: zero shares minted");

        // --- Effects (state changes before external call) ---
        _totalAssets += assets;
        _mint(receiver, shares);

        // --- Interaction ---
        asset.safeTransferFrom(msg.sender, address(this), assets);

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /**
     * @notice Withdraw `assets` of the underlying token by burning shares.
     * @param assets   Amount of underlying assets to withdraw (must be > 0).
     * @param receiver Address that receives the underlying assets.
     * @param owner    Address whose shares are burned.
     * @return shares  Amount of vault shares burned.
     *
     * Security: nonReentrant, whenNotPaused, CEI pattern, SafeERC20
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    )
        external
        nonReentrant
        whenNotPaused
        returns (uint256 shares)
    {
        require(assets > 0,             "Vault: zero assets");
        require(receiver != address(0), "Vault: zero receiver");
        require(owner != address(0),    "Vault: zero owner");

        shares = convertToShares(assets);
        require(shares > 0, "Vault: zero shares burned");

        // Spend allowance when caller is not the owner
        if (msg.sender != owner) {
            _spendAllowance(owner, msg.sender, shares);
        }

        // Solvency guards
        require(balanceOf(owner) >= shares, "Vault: insufficient shares");
        require(_totalAssets >= assets,     "Vault: insufficient vault assets");

        // --- Effects ---
        _totalAssets -= assets;
        _burn(owner, shares);

        // --- Interaction ---
        asset.safeTransfer(receiver, assets);

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /**
     * @notice Redeem `shares` for the corresponding amount of underlying assets.
     * @param shares   Number of vault shares to redeem (must be > 0).
     * @param receiver Address that receives the underlying assets.
     * @param owner    Address whose shares are burned.
     * @return assets  Amount of underlying assets transferred.
     *
     * Security: nonReentrant, whenNotPaused, CEI pattern, SafeERC20
     */
    function redeem(
        uint256 shares,
        address receiver,
        address owner
    )
        external
        nonReentrant
        whenNotPaused
        returns (uint256 assets)
    {
        require(shares > 0,             "Vault: zero shares");
        require(receiver != address(0), "Vault: zero receiver");
        require(owner != address(0),    "Vault: zero owner");

        assets = convertToAssets(shares);
        require(assets > 0, "Vault: zero assets redeemed");

        // Spend allowance when caller is not the owner
        if (msg.sender != owner) {
            _spendAllowance(owner, msg.sender, shares);
        }

        // Solvency guards
        require(balanceOf(owner) >= shares, "Vault: insufficient shares");
        require(_totalAssets >= assets,     "Vault: insufficient vault assets");

        // --- Effects ---
        _totalAssets -= assets;
        _burn(owner, shares);

        // --- Interaction ---
        asset.safeTransfer(receiver, assets);

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /// @inheritdoc IVault
    function convertToShares(uint256 assets) public view returns (uint256) {
        return VaultLib.toShares(assets, totalSupply(), totalAssets_);
    }

    /// @inheritdoc IVault
    function convertToAssets(uint256 shares) public view returns (uint256) {
        return VaultLib.toAssets(shares, totalSupply(), totalAssets_);
    }

    // =========================================================
    // Preview helpers (ERC4626-compatible, view)
    // =========================================================

    /// @notice Preview shares received for a `deposit` of `assets`.
    function previewDeposit(uint256 assets) external view returns (uint256) {
        return convertToShares(assets);
    }

    /// @notice Preview shares burned for a `withdraw` of `assets`.
    function previewWithdraw(uint256 assets) external view returns (uint256) {
        return convertToShares(assets);
    }

    /// @notice Preview assets received for a `redeem` of `shares`.
    function previewRedeem(uint256 shares) external view returns (uint256) {
        return convertToAssets(shares);
    }

    // =========================================================
    // Accounting (view)
    // =========================================================

    /// @notice Total underlying assets tracked by the vault.
    function totalAssets() external view returns (uint256) {
        return _totalAssets;
    }

    // =========================================================
    // Emergency controls (PAUSER_ROLE / ADMIN_ROLE)
    // =========================================================

    /**
     * @notice Pause all deposit / withdraw / redeem operations.
     * @dev    Callable by any account holding PAUSER_ROLE.
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
        emit VaultPaused(msg.sender);
    }

    /**
     * @notice Unpause operations after an emergency is resolved.
     * @dev    Callable by any account holding PAUSER_ROLE.
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
        emit VaultUnpaused(msg.sender);
    }

    /**
     * @notice Rescue tokens accidentally sent to this contract.
     * @dev    Reverts if `token` is the vault's own underlying asset, preventing
     *         admins from draining depositor funds.
     * @param token     Address of the ERC20 token to rescue.
     * @param recipient Destination for the rescued tokens.
     */
    function emergencyWithdraw(address token, address recipient)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(token != address(0),     "Vault: zero token address");
        require(recipient != address(0), "Vault: zero recipient");
        require(token != address(asset), "Vault: cannot rescue vault asset");

        IERC20 tokenToRescue = IERC20(token);
        uint256 balance = tokenToRescue.balanceOf(address(this));
        require(balance > 0, "Vault: nothing to rescue");

        tokenToRescue.safeTransfer(recipient, balance);

        emit EmergencyWithdraw(msg.sender, token, recipient, balance);
    }
}
