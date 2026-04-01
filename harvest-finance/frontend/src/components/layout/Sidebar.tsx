"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  Settings,
  Sprout,
} from "lucide-react";

export const dashboardNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Portfolio", href: "/portfolio", icon: Wallet },
  { label: "Farm Vaults", href: "/dashboard/farm-vaults", icon: Sprout },
  { label: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex-col hidden md:flex z-10">
      <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-harvest-green-600 font-bold text-xl"
        >
          <Sprout className="w-6 h-6" />
          <span>Harvest</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {dashboardNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? "bg-harvest-green-50 text-harvest-green-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-harvest-green-600" : "text-gray-400"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
