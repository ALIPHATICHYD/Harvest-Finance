"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Stack,
  Badge,
} from "@/components/ui";
import { Wallet, ArrowDownLeft, AlertTriangle } from "lucide-react";
import axios from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { enqueueOfflineAction } from "@/lib/offline-support";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: any;
  onSuccess?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  vault,
  onSuccess,
}) => {
  const { token } = useAuthStore();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (Number(amount) > vault.balance) {
      setError("Insufficient balance in vault");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueueOfflineAction({
          type: "withdraw",
          endpoint: `http://localhost:3001/api/v1/farm-vaults/${vault.id}/withdraw`,
          payload: { amount: Number(amount) },
        });
        onSuccess?.();
        onClose();
        setAmount("");
        return;
      }

      await axios.post(
        `http://localhost:3001/api/v1/farm-vaults/${vault.id}/withdraw`,
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess?.();
      onClose();
      setAmount("");
    } catch (err: any) {
      console.error("Withdraw failed:", err);
      setError(
        err.response?.data?.message ||
          "Withdrawal failed. Please check your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isEarlyWithrawal = (vault.projections?.progressPercentage || 0) < 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader title="Withdraw Funds" onClose={onClose} />
      <ModalBody>
        <Stack gap="lg">
          <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
                From Vault
              </p>
              <h4 className="font-bold text-gray-900">{vault.name}</h4>
            </div>
            <Badge variant="error">
              {vault.projections?.progressPercentage}% Season
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
              <span>Available Balance:</span>
              <span className="font-bold text-gray-900">${vault.balance}</span>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Offline withdrawals will stay queued locally until the platform
              reconnects.
            </p>
          </div>

          {isEarlyWithrawal && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed text-amber-800">
                <strong>Attention:</strong> Your crop cycle is not yet complete.
                Early withdrawal may result in reduced seasonal dividends.
              </p>
            </div>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleWithdraw}
          isLoading={isLoading}
          leftIcon={<ArrowDownLeft className="w-4 h-4" />}
        >
          Confirm Withdrawal
        </Button>
      </ModalFooter>
    </Modal>
  );
};
