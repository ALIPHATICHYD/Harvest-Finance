'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  CardBody 
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
import { 
  enqueueOfflineAction, 
  loadDashboardSnapshot, 
  loadOfflineQueue, 
  removeOfflineAction, 
  saveDashboardSnapshot 
} from '@/lib/offline-support';

const defaultTransactions = [
  {
    id: "tx-1",
    type: "Deposit",
    amount: 250,
    status: "Pending sync",
    createdAt: "2026-03-29T07:30:00.000Z",
  },
  {
    id: "tx-2",
    type: "Reward",
    amount: 38,
    status: "Completed",
    createdAt: "2026-03-28T12:15:00.000Z",
  },
  {
    id: "tx-3",
    type: "Withdraw",
    amount: 90,
    status: "Completed",
    createdAt: "2026-03-27T16:45:00.000Z",
  },
];

export default function DashboardPage() {
  const openChat = useAIAssistantStore((state) => state.openChat);
  const { token } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);
  const [queuedActions, setQueuedActions] = useState(0);
  const [snapshotUpdatedAt, setSnapshotUpdatedAt] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    openChat();
  }, [openChat]);

  useEffect(() => {
    const snapshot = loadDashboardSnapshot();
    setSnapshotUpdatedAt(snapshot?.updatedAt ?? null);
    setQueuedActions(loadOfflineQueue().length);
    setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);

    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
      setQueuedActions(loadOfflineQueue().length);
    };

    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);
    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, []);

  const snapshot = useMemo(() => {
    return (
      loadDashboardSnapshot() ?? {
        updatedAt: new Date().toISOString(),
        vaultBalance: 18240,
        totalDeposits: 14750,
        totalRewards: 3490,
        queuedActions,
        activeVaults: 4,
        recentTransactions: defaultTransactions,
      }
    );
  }, [queuedActions]);

  useEffect(() => {
    const updatedAt = new Date().toISOString();
    saveDashboardSnapshot({
      ...snapshot,
      queuedActions,
      updatedAt,
    });
    setSnapshotUpdatedAt(updatedAt);
  }, [queuedActions, snapshot]);

  const syncQueuedActions = async () => {
    if (!navigator.onLine) return;

    setIsSyncing(true);
    const pendingActions = loadOfflineQueue();

    for (const action of pendingActions) {
      try {
        if (action.type === "ai-query") {
          const response = await fetch(action.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action.payload),
          });

          if (!response.ok) continue;

          const body = await response.json();
          useAIAssistantStore.setState((state) => ({
            messages: [
              ...state.messages,
              {
                id: `assistant-sync-${Date.now()}-${action.id}`,
                role: "assistant",
                content: body.message,
                timestamp: new Date(),
                suggestions: body.suggestions,
              },
            ],
            suggestions: body.suggestions || state.suggestions,
          }));
        } else {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };

          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }

          const response = await fetch(action.endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify(action.payload),
          });

          if (!response.ok) continue;
        }

        removeOfflineAction(action.id);
      } catch {
        continue;
      }
    }

    setQueuedActions(loadOfflineQueue().length);
    setIsSyncing(false);
  };

  useEffect(() => {
    if (isOnline && loadOfflineQueue().length > 0) {
      void syncQueuedActions();
    }
  }, [isOnline]);

  const aiContext = {
    selectedCrop: "Maize",
    currentSeason: "Rainy season",
    vaultBalance: snapshot.vaultBalance,
    totalDeposits: snapshot.totalDeposits,
    totalRewards: snapshot.totalRewards,
    vaultTarget: 25000,
    progressPercent: Math.round((snapshot.vaultBalance / 25000) * 100),
  };

  const quickActions = [
    {
      title: "Vault balance",
      value: `$${snapshot.vaultBalance.toLocaleString()}`,
      helper: "Available in offline cache",
      icon: Wallet,
    },
    {
      title: "Total deposits",
      value: `$${snapshot.totalDeposits.toLocaleString()}`,
      helper: "Includes synced and queued activity",
      icon: Database,
    },
    {
      title: "Total rewards",
      value: `$${snapshot.totalRewards.toLocaleString()}`,
      helper: "Seasonal rewards across active vaults",
      icon: TrendingUp,
    },
    {
      title: "Active vaults",
      value: `${snapshot.activeVaults}`,
      helper: "Mobile-friendly overview",
      icon: Leaf,
    },
  ];

  const queueDepositDemo = () => {
    enqueueOfflineAction({
      type: "deposit",
      endpoint: "http://localhost:3001/api/v1/farm-vaults/vault-1/deposit",
      payload: { amount: 150 },
    });
    setQueuedActions(loadOfflineQueue().length);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-6 md:pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="primary" className="mb-2 w-fit">
            Farm Vault Dashboard
          </Badge>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
  Mobile-ready farming intelligence
</h1>
<p className="mt-2 max-w-3xl text-sm md:text-base text-gray-600 dark:text-gray-400">
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            leftIcon={<RefreshCcw className="h-4 w-4" />}
            onClick={syncQueuedActions}
            className="text-sm"
          >
            Refresh sync
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Bot className="h-4 w-4" />}
            onClick={queueDepositDemo}
            className="text-sm"
          >
            Queue demo deposit
          </Button>
        </div>
      </div>

      <ConnectivityBanner
        isOnline={isOnline}
        queuedActions={queuedActions}
        lastUpdated={snapshotUpdatedAt}
        isSyncing={isSyncing}
        onSync={syncQueuedActions}
      />

      <WeatherWidget />
      <MilestoneNotification />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((card) => {
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
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {card.title}
                  </p>
   <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    {card.helper}
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.helper}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <SeasonalTipsList showFilters />
      <CropRecommendationPanel isOnline={isOnline} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)]">
  <div className="space-y-6">
    <FarmActivityMap />
    <VaultOverview />
  </div>
  <div className="space-y-6">
    <Card variant="default" className="h-fit">
      <CardBody className="space-y-5 p-4 md:p-6">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
            Recent vault activity
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cached locally so the latest dashboard view remains visible
            offline.
          </p>
        </div>
        <div className="space-y-3">
          {snapshot.recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-[rgba(141,187,85,0.15)] bg-gray-50 dark:bg-[#1a3020] px-3 md:px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {transaction.type}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(transaction.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right ml-2">
                <p className="font-semibold text-gray-900 dark:text-white">
                  ${transaction.amount}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {transaction.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  </div>
</div>

     {/* Additional Sections */}
<div className="space-y-6">
  <div className="border-t border-gray-200 dark:border-[rgba(141,187,85,0.12)] pt-4">
    <VaultOverview />
  </div>

  <div className="border-t border-gray-200 dark:border-[rgba(141,187,85,0.12)] pt-4">
    <VaultActivityFeed />
  </div>

  <div className="border-t border-gray-200 dark:border-[rgba(141,187,85,0.12)] pt-6">
    <CropInsurancePanel />
  </div>

  <div className="border-t border-gray-200 dark:border-[rgba(141,187,85,0.12)] pt-6">
    <SeasonalTipsList showFilters />
  </div>

  <div className="border-t border-gray-200 dark:border-[rgba(141,187,85,0.12)] pt-6">
    <CropRecommendationPanel isOnline={isOnline} />
  </div>
</div>
      {/* AI Assistant */}
      <AIAssistantChat context={aiContext} />
    </div>
  );
}
