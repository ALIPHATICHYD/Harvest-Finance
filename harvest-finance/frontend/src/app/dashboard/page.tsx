"use client";

import React from "react";
import { VaultOverview } from "@/components/dashboard/VaultOverview";
import { TrendingUp, Wallet, ArrowRight, Activity } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const chartData = [
    { name: "Mon", value: 32000 },
    { name: "Tue", value: 34000 },
    { name: "Wed", value: 33000 },
    { name: "Thu", value: 36000 },
    { name: "Fri", value: 42000 },
    { name: "Sat", value: 41000 },
    { name: "Sun", value: 45231 },
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

export default function DashboardPage() {
    return (
        <div className="space-y-8 pb-10">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Welcome back. Here is an overview of your portfolio.
                    </p>
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
