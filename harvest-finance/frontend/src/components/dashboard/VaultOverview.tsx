"use client";

import React from "react";
import { Database, Coins, TrendingUp } from "lucide-react";
import { VaultCard, VaultProps } from "./VaultCard";

const mockVaults: VaultProps[] = [
  {
    id: "1",
    name: "USDC Stable Yield",
    asset: "USDC",
    apy: "12.5%",
    tvl: "$1.2M",
    balance: "$4,280.00",
    walletBalance: "$1,120.00",
    balance: "2,450",
    walletBalance: "5,300",
    icon: <Database className="w-5 h-5" />,
    onDeposit: () => undefined,
    onWithdraw: () => undefined,
  },
  {
    id: "2",
    name: "ETH Staking Vault",
    asset: "ETH",
    apy: "4.8%",
    tvl: "$4.5M",
    balance: "$2,920.00",
    walletBalance: "$540.00",
    balance: "0.85",
    walletBalance: "1.42",
    icon: <Coins className="w-5 h-5" />,
    onDeposit: () => undefined,
    onWithdraw: () => undefined,
  },
  {
    id: "3",
    name: "Harvest Liquidity",
    asset: "HARV",
    apy: "24.2%",
    tvl: "$820K",
    balance: "$1,640.00",
    walletBalance: "$390.00",
    icon: <TrendingUp className="w-5 h-5" />,
    onDeposit: () => undefined,
    onWithdraw: () => undefined,
  },
  {
    id: "4",
    name: "WBTC Auto-Compound",
    asset: "WBTC",
    apy: "3.1%",
    tvl: "$12.1M",
    balance: "$8,150.00",
    walletBalance: "$890.00",
    icon: <Coins className="w-5 h-5" />,
    onDeposit: () => undefined,
    onWithdraw: () => undefined,
  },
  {
    id: "5",
    name: "XLM Rewards",
    asset: "XLM",
    apy: "8.5%",
    tvl: "$340K",
    balance: "$960.00",
    walletBalance: "$210.00",
    icon: <Database className="w-5 h-5" />,
    onDeposit: () => undefined,
    onWithdraw: () => undefined,
    balance: "184",
    walletBalance: "420",
    icon: <TrendingUp className="w-5 h-5" />,
    onDeposit: () => undefined,
    onWithdraw: () => undefined,
  },
];

export function VaultOverview() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Active Vaults
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Explore opportunities, deposit assets, and watch your yields grow.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {mockVaults.map((vault) => (
          <VaultCard key={vault.id} {...vault} />
        ))}
      </div>
    </section>
  );
}
