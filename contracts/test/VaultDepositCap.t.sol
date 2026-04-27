// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/Vault.sol";
import "../src/MockERC20.sol";

/**
 * @title VaultDepositCapTest
 * @dev Unit + fuzz tests for the per-vault deposit-cap risk control
 *      introduced for issue #131.
 */
contract VaultDepositCapTest is Test {
    Vault internal vault;
    MockERC20 internal asset;

    address internal owner = address(this);
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);
    address internal stranger = address(0xBADBAD);

    event DepositCapUpdated(uint256 oldCap, uint256 newCap);

    function setUp() public {
        asset = new MockERC20("Test", "TEST", 0);
        vault = new Vault(asset, "Vault", "vTEST");

        asset.mint(alice, 1e30);
        asset.mint(bob, 1e30);

        vm.prank(alice);
        asset.approve(address(vault), type(uint256).max);
        vm.prank(bob);
        asset.approve(address(vault), type(uint256).max);
    }

    // --------------------------------------------------------------------
    // Defaults & view
    // --------------------------------------------------------------------

    function test_DefaultCapIsUnlimited() public {
        assertEq(vault.depositCap(), type(uint256).max, "default cap must be uncapped");
        assertEq(vault.maxDeposit(), type(uint256).max, "maxDeposit equals cap when empty");
    }

    function test_MaxDepositReflectsRemainingCapacity() public {
        vault.setDepositCap(1_000e18);
        assertEq(vault.maxDeposit(), 1_000e18);

        vm.prank(alice);
        vault.deposit(400e18, alice);
        assertEq(vault.maxDeposit(), 600e18);

        vm.prank(bob);
        vault.deposit(600e18, bob);
        assertEq(vault.maxDeposit(), 0, "no capacity left after hitting cap");
    }

    function test_MaxDepositReturnsZeroWhenOverCap() public {
        vm.prank(alice);
        vault.deposit(500e18, alice);

        // Lower the cap below current totalAssets — maxDeposit must clamp to 0.
        vault.setDepositCap(100e18);
        assertEq(vault.maxDeposit(), 0);
    }

    // --------------------------------------------------------------------
    // Authorization
    // --------------------------------------------------------------------

    function test_OwnerCanSetCap() public {
        vault.setDepositCap(123e18);
        assertEq(vault.depositCap(), 123e18);
    }

    function test_NonOwnerCannotSetCap() public {
        vm.prank(stranger);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.setDepositCap(123e18);
    }

    // --------------------------------------------------------------------
    // Event emission
    // --------------------------------------------------------------------

    function test_SetDepositCapEmitsEvent() public {
        vm.expectEmit(true, true, true, true, address(vault));
        emit DepositCapUpdated(type(uint256).max, 500e18);
        vault.setDepositCap(500e18);

        vm.expectEmit(true, true, true, true, address(vault));
        emit DepositCapUpdated(500e18, 1_000e18);
        vault.setDepositCap(1_000e18);
    }

    // --------------------------------------------------------------------
    // Enforcement: boundaries
    // --------------------------------------------------------------------

    function test_DepositExactlyAtCapSucceeds() public {
        vault.setDepositCap(1_000e18);

        vm.prank(alice);
        uint256 shares = vault.deposit(1_000e18, alice);

        assertEq(vault.totalAssets(), 1_000e18);
        assertGt(shares, 0);
        assertEq(vault.maxDeposit(), 0);
    }

    function test_DepositOneWeiOverCapReverts() public {
        vault.setDepositCap(1_000e18);

        vm.prank(alice);
        vm.expectRevert("Vault: deposit cap exceeded");
        vault.deposit(1_000e18 + 1, alice);
    }

    function test_DepositSpanningCapAcrossUsersReverts() public {
        vault.setDepositCap(1_000e18);

        vm.prank(alice);
        vault.deposit(900e18, alice);

        // Bob's 200e18 would push totalAssets to 1100e18 > 1000e18.
        vm.prank(bob);
        vm.expectRevert("Vault: deposit cap exceeded");
        vault.deposit(200e18, bob);

        // But Bob can deposit exactly the remaining 100e18.
        vm.prank(bob);
        vault.deposit(100e18, bob);
        assertEq(vault.totalAssets(), 1_000e18);
    }

    function test_ZeroCapBlocksAllDeposits() public {
        vault.setDepositCap(0);
        vm.prank(alice);
        vm.expectRevert("Vault: deposit cap exceeded");
        vault.deposit(1, alice);
    }

    // --------------------------------------------------------------------
    // Enforcement: dynamic cap changes
    // --------------------------------------------------------------------

    function test_IncreasingCapAllowsMoreDeposits() public {
        vault.setDepositCap(500e18);

        vm.prank(alice);
        vault.deposit(500e18, alice);

        vm.prank(bob);
        vm.expectRevert("Vault: deposit cap exceeded");
        vault.deposit(1, bob);

        vault.setDepositCap(1_500e18);

        vm.prank(bob);
        vault.deposit(1_000e18, bob);
        assertEq(vault.totalAssets(), 1_500e18);
    }

    function test_DecreasingCapBelowTotalAssetsBlocksNewDepositsButPreservesExisting() public {
        vault.setDepositCap(2_000e18);

        vm.prank(alice);
        vault.deposit(1_500e18, alice);
        uint256 aliceSharesBefore = vault.balanceOf(alice);
        uint256 totalBefore = vault.totalAssets();

        // Lower cap below current totalAssets.
        vault.setDepositCap(1_000e18);

        // Existing balances and total assets are untouched.
        assertEq(vault.balanceOf(alice), aliceSharesBefore);
        assertEq(vault.totalAssets(), totalBefore);

        // No new deposits accepted.
        vm.prank(bob);
        vm.expectRevert("Vault: deposit cap exceeded");
        vault.deposit(1, bob);

        // Withdrawals still work despite being over cap.
        vm.prank(alice);
        vault.withdraw(700e18, alice, alice);
        assertEq(vault.totalAssets(), 800e18);

        // After totalAssets drops below cap, new deposits resume up to remaining capacity.
        vm.prank(bob);
        vault.deposit(200e18, bob);
        assertEq(vault.totalAssets(), 1_000e18);
    }

    function test_LoweringCapToCurrentTotalAllowsZeroFurtherDeposits() public {
        vm.prank(alice);
        vault.deposit(500e18, alice);

        vault.setDepositCap(500e18);

        vm.prank(bob);
        vm.expectRevert("Vault: deposit cap exceeded");
        vault.deposit(1, bob);
    }

    // --------------------------------------------------------------------
    // Fuzz: any deposit that respects the cap succeeds; any that breaches reverts.
    // --------------------------------------------------------------------

    function testFuzz_DepositRespectsCap(uint256 cap, uint256 first, uint256 second) public {
        cap = bound(cap, 1, 1e27);
        first = bound(first, 1, cap);
        second = bound(second, 1, type(uint128).max);

        vault.setDepositCap(cap);

        vm.prank(alice);
        vault.deposit(first, alice);
        assertEq(vault.totalAssets(), first);

        if (vault.totalAssets() + second <= cap) {
            vm.prank(bob);
            vault.deposit(second, bob);
            assertEq(vault.totalAssets(), first + second);
        } else {
            vm.prank(bob);
            vm.expectRevert("Vault: deposit cap exceeded");
            vault.deposit(second, bob);
        }
    }

    function testFuzz_OnlyOwnerCanSetCap(address caller, uint256 newCap) public {
        vm.assume(caller != owner && caller != address(0));
        vm.prank(caller);
        vm.expectRevert("Ownable: caller is not the owner");
        vault.setDepositCap(newCap);
    }
}
