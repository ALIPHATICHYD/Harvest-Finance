"use client";

import { Badge, Button, Card, CardBody } from "@/components/ui";
import { CloudOff, RefreshCcw, Wifi } from "lucide-react";

interface ConnectivityBannerProps {
  isOnline: boolean;
  queuedActions: number;
  lastUpdated?: string | null;
  isSyncing: boolean;
  onSync: () => void;
}

export function ConnectivityBanner({
  isOnline,
  queuedActions,
  lastUpdated,
  isSyncing,
  onSync,
}: ConnectivityBannerProps) {
  return (
    <Card
      variant="outlined"
      className={
        isOnline
          ? "border-emerald-200 bg-emerald-50/80"
          : "border-amber-200 bg-amber-50/90"
      }
    >
      <CardBody className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full ${
              isOnline
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {isOnline ? (
              <Wifi className="h-5 w-5" />
            ) : (
              <CloudOff className="h-5 w-5" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">
                {isOnline
                  ? "Online and syncing normally"
                  : "Offline mode is active"}
              </h2>
              <Badge
                variant={queuedActions > 0 ? "warning" : "success"}
                size="sm"
                isPill
              >
                {queuedActions} queued action{queuedActions === 1 ? "" : "s"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {isOnline
                ? "Cached vault data stays available, and queued deposits or AI requests will sync automatically."
                : "You can keep browsing your vault snapshot, queue deposits, withdrawals, and AI requests, and sync them when the connection returns."}
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-500">
                Cached snapshot updated {new Date(lastUpdated).toLocaleString()}
                .
              </p>
            )}
          </div>
        </div>
        <Button
          variant={isOnline ? "primary" : "outline"}
          size="sm"
          isLoading={isSyncing}
          onClick={onSync}
          leftIcon={<RefreshCcw className="h-4 w-4" />}
          isDisabled={!isOnline || queuedActions === 0}
        >
          Sync queued actions
        </Button>
      </CardBody>
    </Card>
  );
}
