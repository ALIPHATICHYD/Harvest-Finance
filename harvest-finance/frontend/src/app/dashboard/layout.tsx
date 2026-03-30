import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu, Sprout, Search, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { NotificationCenter } from "@/components/Notification/NotificationCenter";

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
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <button className="p-2 text-gray-500 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-harvest-green-500">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex bg-white border-b border-gray-200 h-16 items-center px-8 justify-between flex-shrink-0 z-10 sticky top-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search vaults, assets..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-harvest-green-500 focus:border-harvest-green-500 sm:text-sm transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <div className="h-8 w-px bg-gray-200 mx-2" />
            <button className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-harvest-green-500">
              <div className="w-8 h-8 rounded-full bg-harvest-green-100 flex items-center justify-center text-harvest-green-700 font-bold">
                <UserIcon className="w-5 h-5" />
              </div>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
