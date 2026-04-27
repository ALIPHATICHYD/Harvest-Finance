// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./interfaces/IVault.sol";
import "./libraries/VaultLib.sol";

/**
 * @title Vault
 * @dev ERC4626-like vault implementing IVault. Upgradeable via UUPS.
 * Includes withdrawal rate limiting per block.
 */
contract Vault is Initializable, IVault, ERC20Upgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using VaultLib for uint256;

    // Roles
    bytes32 public constant ADMIN_ROLE  = keccak256("ADMIN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // State
    IERC20Upgradeable public asset;
    uint256 private _totalAssets;
    uint256 public depositCap;
    bool public paused;

    // Rate Limiting
    uint256 public maxWithdrawalPerBlock;
    uint256 public lastWithdrawalBlock;
    uint256 public cumulativeWithdrawalsInBlock;

    // Events
    event DepositCapUpdated(uint256 oldCap, uint256 newCap);
    event WithdrawalLimitUpdated(uint256 oldLimit, uint256 newLimit);
    event VaultPaused(address indexed pauser);
    event VaultUnpaused(address indexed pauser);
    event EmergencyWithdraw(address indexed admin, address indexed token, address indexed recipient, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @param _asset   The underlying ERC20 token.
     * @param _name    Vault share token name.
     * @param _symbol  Vault share token symbol.
     * @param admin    Address that receives roles.
     */
    function initialize(
        IERC20Upgradeable _asset,
        string memory _name,
        string memory _symbol,
        address admin
    ) public initializer {
        require(address(_asset) != address(0), "Vault: zero asset");
        require(admin != address(0),            "Vault: zero admin");

        __ERC20_init(_name, _symbol);
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        asset = _asset;
        depositCap = type(uint256).max;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE,         admin);
        _grantRole(PAUSER_ROLE,        admin);
        _grantRole(UPGRADER_ROLE,      admin);
    }

    modifier whenNotPaused() {
        require(!paused, "Vault: paused");
        _;
    }

    /**
     * @notice Deposit assets and receive shares.
     */
    function deposit(uint256 assets, address receiver)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 shares)
    {
        require(assets > 0,             "Vault: zero assets");
        require(receiver != address(0), "Vault: zero receiver");
        require(_totalAssets + assets <= depositCap, "Vault: deposit cap exceeded");

        shares = convertToShares(assets);
        require(shares > 0, "Vault: zero shares minted");

        _totalAssets += assets;
        _mint(receiver, shares);

        asset.safeTransferFrom(msg.sender, address(this), assets);

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /**
     * @notice Withdraw assets by burning shares. Subject to per-block rate limit.
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

        _checkWithdrawalLimit(assets);

        shares = convertToShares(assets);
        require(shares > 0, "Vault: zero shares burned");

        if (msg.sender != owner) {
            _spendAllowance(owner, msg.sender, shares);
        }

        require(balanceOf(owner) >= shares, "Vault: insufficient shares");
        require(_totalAssets >= assets,     "Vault: insufficient vault assets");

        _totalAssets -= assets;
        _burn(owner, shares);

        asset.safeTransfer(receiver, assets);

        emit Withdraw(msg.sender, receiver, assets, shares);
    }

    /**
     * @notice Redeem shares for assets. Subject to per-block rate limit.
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

        _checkWithdrawalLimit(assets);

        if (msg.sender != owner) {
            _spendAllowance(owner, msg.sender, shares);
        }

        require(balanceOf(owner) >= shares, "Vault: insufficient shares");
        require(_totalAssets >= assets,     "Vault: insufficient vault assets");

        _totalAssets -= assets;
        _burn(owner, shares);

        asset.safeTransfer(receiver, assets);

        emit Withdraw(msg.sender, receiver, assets, shares);
    }

    /**
     * @dev Internal helper to enforce per-block withdrawal limits.
     */
    function _checkWithdrawalLimit(uint256 amount) internal {
        if (maxWithdrawalPerBlock == 0) return; // Limit disabled

        if (block.number > lastWithdrawalBlock) {
            lastWithdrawalBlock = block.number;
            cumulativeWithdrawalsInBlock = amount;
        } else {
            cumulativeWithdrawalsInBlock += amount;
        }
        require(cumulativeWithdrawalsInBlock <= maxWithdrawalPerBlock, "Vault: block withdrawal limit exceeded");
    }

    // --- Admin Functions ---

    function setWithdrawalLimit(uint256 limit) external onlyRole(ADMIN_ROLE) {
        emit WithdrawalLimitUpdated(maxWithdrawalPerBlock, limit);
        maxWithdrawalPerBlock = limit;
    }

    function setDepositCap(uint256 cap) external onlyRole(ADMIN_ROLE) {
        emit DepositCapUpdated(depositCap, cap);
        depositCap = cap;
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        paused = true;
        emit VaultPaused(msg.sender);
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        paused = false;
        emit VaultUnpaused(msg.sender);
    }

    function emergencyWithdraw(address token, address recipient) external onlyRole(ADMIN_ROLE) {
        require(token != address(0), "Vault: zero token");
        require(recipient != address(0), "Vault: zero recipient");
        require(token != address(asset), "Vault: cannot rescue vault asset");

        uint256 balance = IERC20Upgradeable(token).balanceOf(address(this));
        require(balance > 0, "Vault: nothing to rescue");

        IERC20Upgradeable(token).safeTransfer(recipient, balance);
        emit EmergencyWithdraw(msg.sender, token, recipient, balance);
    }

    // --- View Functions ---

    function convertToShares(uint256 assets) public view returns (uint256) {
        return VaultLib.toShares(assets, totalSupply(), _totalAssets);
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        return VaultLib.toAssets(shares, totalSupply(), _totalAssets);
    }

    function totalAssets() external view returns (uint256) {
        return _totalAssets;
    }

    function previewDeposit(uint256 assets) external view returns (uint256) {
        return convertToShares(assets);
    }

    function previewWithdraw(uint256 assets) external view returns (uint256) {
        return convertToShares(assets);
    }

    function previewRedeem(uint256 shares) external view returns (uint256) {
        return convertToAssets(shares);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
}
