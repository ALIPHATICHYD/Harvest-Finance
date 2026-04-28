// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./interfaces/IVault.sol";
import "./interfaces/IOracle.sol";

/**
 * @title Controller
 * @dev Manages vaults and strategies for Harvest Finance.
 */
contract Controller is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    address public storageContract;
    address public oracle;
    mapping(address => bool) public vaults;
    mapping(address => address) public strategies;

    event VaultAdded(address indexed vault);
    event StrategySet(address indexed vault, address indexed strategy);
    event OracleSet(address indexed oracle);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address governance, address _storage) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, governance);
        storageContract = _storage;
    }

    function setOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_oracle != address(0), "Controller: zero address");
        oracle = _oracle;
        emit OracleSet(_oracle);
    }

    /**
     * @notice Add a vault to be managed by this controller.
     * @param vault Address of the vault.
     */
    function addVault(address vault) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(vault != address(0), "Controller: zero address");
        vaults[vault] = true;
        emit VaultAdded(vault);
    }

    /**
     * @notice Set the strategy for a specific vault.
     * @param vault    Address of the vault.
     * @param strategy Address of the strategy.
     */
    function setStrategy(address vault, address strategy) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(vaults[vault], "Controller: vault not added");
        require(strategy != address(0), "Controller: zero strategy");
        strategies[vault] = strategy;
        emit StrategySet(vault, strategy);
    }

    /**
     * @notice Perform "hard work" (rebalancing, compounding) for a vault.
     * @param vault Address of the vault.
     */
    function doHardWork(address vault) external onlyRole(OPERATOR_ROLE) {
        require(vaults[vault], "Controller: unknown vault");
        require(strategies[vault] != address(0), "Controller: no strategy");
        require(oracle != address(0), "Controller: oracle not set");
        
        address asset = address(IVault(vault).asset());
        require(!IOracle(oracle).isStale(asset), "Controller: stale price");
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
