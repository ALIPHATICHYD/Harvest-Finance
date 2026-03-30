"use client";

import React from "react";
import { VaultCard, VaultProps } from "./VaultCard";
import { Database, Coins, TrendingUp } from "lucide-react";

// Placeholder data for the Vaults
const mockVaults: VaultProps[] = [
  {
    id: "1",
    name: "USDC Stable Yield",
    tokenSymbol: "USDC",
    apy: 12.5,
    tvl: "$1.2M",
    icon: <Database className="w-5 h-5" />,
  },
  {
    id: "2",
    name: "ETH Staking Vault",
    tokenSymbol: "ETH",
    apy: 4.8,
    tvl: "$4.5M",
    icon: <Coins className="w-5 h-5" />,
  },
  {
    id: "3",
    name: "Harvest Liquidity",
    tokenSymbol: "HARV",
    apy: 24.2,
    tvl: "$820K",
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: "4",
    name: "WBTC Auto-Compound",
    tokenSymbol: "WBTC",
    apy: 3.1,
    tvl: "$12.1M",
    icon: <Coins className="w-5 h-5" />,
  },
  {
    id: "5",
    name: "XLM Rewards",
    tokenSymbol: "XLM",
    apy: 8.5,
    tvl: "$340K",
    icon: <Database className="w-5 h-5" />,
  },
];

export function VaultOverview() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Active Vaults</h2>
        <p className="text-sm text-gray-500 mt-1">
          Explore opportunities, deposit assets, and watch your yields grow.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockVaults.map((vault) => (
          <VaultCard key={vault.id} vault={vault} />
        ))}
      </div>
    </section>
  );
}
