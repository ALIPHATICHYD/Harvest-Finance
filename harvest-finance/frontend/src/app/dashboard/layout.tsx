import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu, Sprout } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Harvest Finance",
  description: "View and manage your vaults and portfolio",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4 justify-between flex-shrink-0 z-10 sticky top-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-harvest-green-600 font-bold text-lg"
          >
            <Sprout className="w-5 h-5" />
            <span>Harvest</span>
          </Link>
          <button className="p-2 text-gray-500 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-harvest-green-500">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
