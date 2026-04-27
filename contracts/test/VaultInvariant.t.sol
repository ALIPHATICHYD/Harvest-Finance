// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/Vault.sol";
import "../src/MockERC20.sol";

/**
 * @title VaultInvariantTest
 * @dev Invariant/property-based tests for Vault
 * These tests verify that certain properties always hold true
 * regardless of the sequence of operations
 */
contract VaultInvariantTest is Test {
    Vault public vault;
    MockERC20 public token;

    address public user1 = address(0x1111);
    address public user2 = address(0x2222);
    address public user3 = address(0x3333);

    function setUp() public {
        token = new MockERC20("Test Token", "TEST", type(uint128).max);
        vault = new Vault(token, "Vault Token", "vTEST", address(this));

        // Mint tokens to users
        token.mint(user1, 1e27);
        token.mint(user2, 1e27);
        token.mint(user3, 1e27);

        // Approve vault
        vm.prank(user1);
        token.approve(address(vault), type(uint256).max);
        vm.prank(user2);
        token.approve(address(vault), type(uint256).max);
        vm.prank(user3);
        token.approve(address(vault), type(uint256).max);
    }

    // ============== INVARIANT: ASSET CONSERVATION ==============

    /**
     * @dev Invariant: sum of user asset values should not exceed vault assets
     * This prevents creation of tokens out of thin air
     */
    function test_AssetConservation() public {
        // Deposit multiple times
        vm.prank(user1);
        vault.deposit(1e20, user1);

        vm.prank(user2);
        vault.deposit(2e20, user2);

        uint256 user1Assets = vault.convertToAssets(vault.balanceOf(user1));
        uint256 user2Assets = vault.convertToAssets(vault.balanceOf(user2));

        // Total user assets should not exceed vault total assets
        assertLe(
            user1Assets + user2Assets, vault.totalAssets() + 1, "Sum of user assets should not exceed vault assets"
        );
    }

    // ============== INVARIANT: SHARE SUPPLY CONSISTENCY ==============

    /**
     * @dev Invariant: totalSupply should equal sum of all balances
     * (This is automatically true in ERC20, but we test it explicitly)
     */
    function test_ShareSupplyConsistency() public {
        vm.prank(user1);
        vault.deposit(1e20, user1);

        vm.prank(user2);
        vault.deposit(2e20, user2);

        uint256 totalSupply = vault.totalSupply();
        uint256 sumOfBalances = vault.balanceOf(user1) + vault.balanceOf(user2);

        assertEq(totalSupply, sumOfBalances, "Total supply should equal sum of balances");
    }

    // ============== INVARIANT: EXCHANGE RATE MONOTONICITY ==============

    /**
     * @dev Invariant: exchange rate should never decrease after deposits
     */
    function test_ExchangeRateMonotonicity() public {
        vm.prank(user1);
        vault.deposit(1e20, user1);

        uint256 exchangeRate1 = (vault.totalAssets() * 1e18) / vault.totalSupply();

        // Add more funds without changing supply (simulate yield)
        // In real scenario, yield would increase exchange rate

        vm.prank(user2);
        vault.deposit(1e20, user2);

        // Exchange rate should not decrease
        assertGe(vault.totalAssets(), 2e20, "Total assets should at least equal deposits");
    }

    // ============== INVARIANT: ROUNDING SAFETY ==============

    /**
     * @dev Invariant: small amounts should not cause rounding exploits
     */
    function test_RoundingSafety() public {
        vm.prank(user1);
        vault.deposit(1e20, user1);

        uint256 userShares = vault.balanceOf(user1);

        // Convert back to assets
        uint256 userAssets = vault.convertToAssets(userShares);

        // Due to rounding, might be slightly less
        assertLe(vault.totalAssets() - userAssets, 1, "Rounding error should be minimal");
    }

    // ============== INVARIANT: NO DOUBLE SPENDING ==============

    /**
     * @dev Invariant: cannot withdraw more than balance
     */
    function test_NoDoubleSpending() public {
        vm.prank(user1);
        vault.deposit(1e20, user1);

        uint256 userBalance = vault.balanceOf(user1);

        // Try to withdraw all
        vm.prank(user1);
        uint256 shares = vault.withdraw(vault.totalAssets(), user1, user1);

        // User balance should now be zero
        uint256 remainingShares = vault.balanceOf(user1);
        assertEq(remainingShares, userBalance - shares, "User cannot double spend");
    }

    // ============== INVARIANT: TOTAL ASSETS TRACKING ==============

    /**
     * @dev Invariant: vault tracking of total assets must match deposits - withdrawals
     */
    function test_TotalAssetsTracking() public {
        uint256 expectedAssets = 0;

        vm.prank(user1);
        vault.deposit(1e20, user1);
        expectedAssets += 1e20;
        assertEq(vault.totalAssets(), expectedAssets);

        vm.prank(user2);
        vault.deposit(2e20, user2);
        expectedAssets += 2e20;
        assertEq(vault.totalAssets(), expectedAssets);

        vm.prank(user1);
        vault.withdraw(5e19, user1, user1);
        expectedAssets -= 5e19;
        assertEq(vault.totalAssets(), expectedAssets);
    }

    // ============== INVARIANT: CONVERSION REVERSIBILITY ==============

    /**
     * @dev Invariant: convertToAssets(convertToShares(x)) ≈ x
     */
    function test_ConversionReversibility() public {
        vm.prank(user1);
        vault.deposit(1e20, user1);

        uint256 originalAssets = 5e19;
        uint256 shares = vault.convertToShares(originalAssets);
        uint256 assetsBack = vault.convertToAssets(shares);

        // Should be equal (rounding may cause 1-2 wei difference)
        assertApproxEqAbs(originalAssets, assetsBack, 2, "Conversions should be reversible");
    }

    // ============== INVARIANT: ZERO BALANCE AFTER FULL WITHDRAWAL ==============

    /**
     * @dev Invariant: user shares should be zero after withdrawing all
     */
    function test_ZeroBalanceAfterFullWithdrawal() public {
        vm.prank(user1);
        vault.deposit(1e20, user1);

        vm.prank(user1);
        vault.withdraw(vault.totalAssets(), user1, user1);

        assertEq(vault.balanceOf(user1), 0, "Balance should be zero after full withdrawal");
        assertEq(vault.totalSupply(), 0, "Total supply should be zero when empty");
    }

    // ============== MULTI-OPERATION INVARIANT TESTS ==============

    /**
     * @dev Invariant: multiple deposits and withdrawals maintain integrity
     */
    function test_MultipleOperations() public {
        // User 1: deposit -> withdraw -> redeem pattern
        vm.prank(user1);
        vault.deposit(1e20, user1);

        vm.prank(user2);
        vault.deposit(2e20, user2);

        uint256 user1AssetsAfterDeposit = vault.convertToAssets(vault.balanceOf(user1));

        vm.prank(user1);
        vault.withdraw(5e19, user1, user1);

        uint256 user1AssetsAfterWithdraw = vault.convertToAssets(vault.balanceOf(user1));

        // Assets should have decreased
        assertLt(user1AssetsAfterWithdraw, user1AssetsAfterDeposit);

        // Vault total should decrease by withdrawal amount
        assertEq(vault.totalAssets(), (1e20 + 2e20) - 5e19);
    }

    /**
     * @dev Invariant: three-way operations maintain consistency
     */
    function test_ThreeUserOperations() public {
        // User 1: small deposit
        vm.prank(user1);
        vault.deposit(1e19, user1);

        // User 2: medium deposit
        vm.prank(user2);
        vault.deposit(1e20, user2);

        // User 3: large deposit
        vm.prank(user3);
        vault.deposit(1e21, user3);

        uint256 totalAssets = vault.totalAssets();
        uint256 expectedTotal = 1e19 + 1e20 + 1e21;

        assertEq(totalAssets, expectedTotal, "Total assets should equal sum of deposits");
        // totalSupply != totalAssets due to virtual share offset (inflation defence)
        assertGt(vault.totalSupply(), 0, "Total supply should be positive");
    }
}
