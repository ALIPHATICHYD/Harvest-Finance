'use client';

import { useEffect, useMemo, useState } from 'react';
import { 
  Bot, 
  Database, 
  Leaf, 
  RefreshCcw, 
  TrendingUp, 
  Wallet 
} from 'lucide-react';
import { 
  Badge, 
  Button, 
  Card, 
  CardBody,
  MetricCardSkeleton,
} from '@/components/ui';

import { AIAssistantChat } from '@/components/ai-assistant';
import { 
  VaultOverview, 
  VaultActivityFeed, 
  ConnectivityBanner, 
  CropRecommendationPanel, 
  FarmActivityMap, 
  WeatherWidget, 
  CropInsurancePanel 
} from '@/components/dashboard';

import { 
  MilestoneNotification, 
  SeasonalTipsList 
} from '@/components/seasonal-tips';

import { useAIAssistantStore } from '@/hooks/useAIAssistant';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSync } from '@/hooks/useSync';
import { 
  loadDashboardSnapshot, 
  saveDashboardSnapshot 
} from '@/lib/offline-support';

const defaultTransactions = [
  {
    id: "tx-1",
    type: "Deposit",
    amount: 250,
    status: "Synced",
    createdAt: "2026-03-29T07:30:00.000Z",
  },
  {
    id: "tx-2",
    type: "Reward",
    amount: 38,
    status: "Completed",
    createdAt: "2026-03-28T12:15:00.000Z",
  },
];

const positions = [
    {
        vault: "ETH Stablecoin LP",
        tvl: "$12,231",
        apy: "8.45%",
        earnings: "$34.21",
    },
    { vault: "WBTC Core", tvl: "$9,876", apy: "6.72%", earnings: "$18.76" },
    { vault: "WBTC Core", tvl: "$9,876", apy: "6.72%", earnings: "$18.76" },
    { vault: "ETH LST LP", tvl: "$7,231", apy: "7.91%", earnings: "$15.32" },
];

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isSyncing
          ? Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
          : quickActions.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} variant="default" className="hover:shadow-md transition-shadow">
              <CardBody className="space-y-4 p-4 md:p-5">
                <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-harvest-green-50 dark:bg-harvest-green-900/40 text-harvest-green-700 dark:text-harvest-green-300">
  <Icon className="h-4 w-4 md:h-5 md:w-5" />
</div>
                  <Badge variant="success" size="sm" isPill>
                    Cached
                  </Badge>
                </div>
                <div className="flex items-center">
                    <Button
                        variant="primary"
                        leftIcon={<Wallet className="w-4 h-4" />}
                    >
                        Connect Wallet
                    </Button>
                </div>
            </div>
            {/* Quick Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card variant="default">
                    <CardBody className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-harvest-green-50 flex items-center justify-center text-harvest-green-600 flex-shrink-0">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Total Deposits
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                $0.00
                            </p>
                        </div>
                    </CardBody>
                </Card>
                <Card variant="default">
                    <CardBody className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Total Rewards
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                $0.00
                            </p>
                        </div>
                    </CardBody>
                </Card>
                <Card variant="default">
                    <CardBody className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-harvest-green-50 flex items-center justify-center text-harvest-green-600">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Total Value Locked
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                $45,231.89
                            </p>
                            <p className="text-sm text-harvest-green-600">
                                +3.89%
                            </p>
                        </div>
                    </CardBody>
                </Card>
                <Card variant="default">
                    <CardBody className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Daily Earnings
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                $124.56
                            </p>
                            <p className="text-sm text-emerald-600">+12.45%</p>
                        </div>
                    </CardBody>
                </Card>
                <Card variant="default">
                    <CardBody className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Active Vaults
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                7
                            </p>
                            <p className="text-sm text-gray-500">
                                Across 5 vaults
                            </p>
                        </div>
                    </CardBody>
                </Card>
                {/* Optional Action Card */}{" "}
                <Card
                    variant="default"
                    className="hidden lg:block bg-gradient-to-br from-harvest-green-600 to-harvest-green-800 text-white border-none"
                >
                    <CardBody className="p-5 flex flex-col justify-center h-full">
                        <h3 className="font-semibold text-lg mb-1">
                            Discover Vaults
                        </h3>
                        <p className="text-harvest-green-100 text-sm mb-3">
                            Earn yield on your crypto assets safely.
                        </p>
                        <div className="flex items-center text-sm font-medium hover:text-harvest-green-200 cursor-pointer">
                            Explore now <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                    </CardBody>
                </Card>
            </div>
            {/* Chart Section */}
            <section className="grid gap-4 lg:grid-cols-2">
                <div>
                    <Card variant="default">
                        <CardBody className="px-2 py-4 h-75">
                            <p className="text-sm text-gray-500 mb-2">
                                Portfolio Overview
                            </p>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#16a34a"
                                        fill="#16a34a"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>
                </div>

                {/* Active Positions */}
                <div>
                    <Card variant="default">
                        <CardBody className="p-5">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Active Vault Positions
                                </p>
                                <span className="text-sm text-harvest-green-600 cursor-pointer flex items-center">
                                    View all{" "}
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </span>
                            </div>

                            <div className="space-y-4">
                                {positions.map((p, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between border-b border-gray-100 pb-2"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {p.vault}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                TVL {p.tvl}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-emerald-600 text-sm">
                                                {p.apy}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {p.earnings}/day
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </section>
            {/* Main Content Sections */}{" "}
            <div className="pt-4 border-t border-gray-200">
                <VaultOverview />
            </div>
        </div>
    );
}
