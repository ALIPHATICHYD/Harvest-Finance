'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type VaultActivityType = 'deposit' | 'withdrawal' | 'milestone' | 'ai_insight';

export interface VaultActivityEvent {
  type: VaultActivityType;
  vaultId: string;
  vaultName: string;
  amount?: number;
  userId?: string;
  milestone?: string;
  insight?: string;
  newBalance?: number;
  timestamp: string;
}

interface UseVaultRealtimeOptions {
  vaultIds?: string[];
  maxActivityItems?: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export function useVaultRealtime({
  vaultIds = [],
  maxActivityItems = 20,
}: UseVaultRealtimeOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activities, setActivities] = useState<VaultActivityEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<VaultActivityEvent | null>(null);

  const addActivity = useCallback(
    (event: VaultActivityEvent) => {
      setActivities((prev) => [event, ...prev].slice(0, maxActivityItems));
      setLatestEvent(event);
    },
    [maxActivityItems],
  );

  useEffect(() => {
    const socket = io(`${BACKEND_URL}/vault-activity`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Subscribe to specific vaults
      vaultIds.forEach((id) => socket.emit('subscribe:vault', id));
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('vault:activity:global', (event: VaultActivityEvent) => {
      addActivity(event);
    });

    socket.on('vault:activity', (event: VaultActivityEvent) => {
      addActivity(event);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscribeToVault = useCallback((vaultId: string) => {
    socketRef.current?.emit('subscribe:vault', vaultId);
  }, []);

  const unsubscribeFromVault = useCallback((vaultId: string) => {
    socketRef.current?.emit('unsubscribe:vault', vaultId);
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
    setLatestEvent(null);
  }, []);

  return {
    isConnected,
    activities,
    latestEvent,
    subscribeToVault,
    unsubscribeFromVault,
    clearActivities,
  };
}
