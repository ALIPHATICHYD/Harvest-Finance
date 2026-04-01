"use client";

import React, { useState } from "react";
import {
  Badge,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
} from "@/components/ui";
import { enqueueOfflineAction } from "@/lib/offline-support";
import { useAuthStore } from "@/lib/stores/auth-store";
import axios from "@/lib/api-client";
import { ArrowUpRight, Wallet } from "lucide-react";

interface DepositModalVault {
  id: string;
  name: string;
  asset: string;
  walletBalance: string;
  tvl: string;
  balance?: number | string;
  cropCycle?: { yieldRate: number };
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: DepositModalVault | null;
  onSuccess?: () => void;
  onDepositSuccess?: (vaultId: string, amount: number) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  vault,
  onSuccess,
  onDepositSuccess,
}) => {
  const { token } = useAuthStore();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    if (!vault) {
      setError("Please select a vault");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueueOfflineAction({
          type: "deposit",
          endpoint: `http://localhost:3001/api/v1/farm-vaults/${vault.id}/deposit`,
          payload: { amount: Number(amount) },
        });
        onSuccess?.();
        onDepositSuccess?.(vault.id, Number(amount));
        onClose();
        setAmount("");
        return;
      }

      await axios.post(
        `http://localhost:3001/api/v1/farm-vaults/${vault.id}/deposit`,
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      onSuccess?.();
      onDepositSuccess?.(vault.id, Number(amount));
      onClose();
      setAmount("");
    } catch (err: any) {
      console.error("Deposit failed:", err);
      setError(
        err.response?.data?.message ||
          "Deposit failed. Please check your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader title="Deposit Funds" onClose={onClose} />
      <ModalBody>
        <Stack gap="lg">
          <div className="flex items-center justify-between rounded-xl border border-harvest-green-100 bg-harvest-green-50 p-4">
            <div>
              <p className="text-xs font-semibold text-harvest-green-700 uppercase tracking-wider">
                Active Vault
              </p>
              <h4 className="font-bold text-gray-900">{vault?.name}</h4>
            </div>
            <Badge variant="success">
              APY: {vault?.cropCycle?.yieldRate ?? 0}%
            </Badge>
          </div>

          <Input
            label="Amount (USD)"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={<Wallet className="w-4 h-4 text-gray-400" />}
            error={error || undefined}
            type="number"
            autoFocus
          />

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-500">
            <p className="mb-1 flex justify-between">
              <span>Current Balance:</span>
              <span className="font-bold text-gray-900">
                ${vault?.balance ?? 0}
              </span>
            </p>
            <p className="flex justify-between">
              <span>Estimated Seasonal Yield:</span>
              <span className="font-bold text-harvest-green-600">
                +$
                {(
                  ((Number(amount) || 0) * (vault?.cropCycle?.yieldRate || 0)) /
                  100
                ).toFixed(2)}
              </span>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Offline deposits will be queued automatically and synced when your
              connection returns.
            </p>
          </div>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleDeposit}
          isLoading={isLoading}
          leftIcon={<ArrowUpRight className="w-4 h-4" />}
        >
          Confirm Deposit
        </Button>
      </ModalFooter>
    </Modal>
  );
};
