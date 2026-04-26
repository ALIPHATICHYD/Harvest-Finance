"use client";

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  Alert,
} from "@/components/ui";
import { parseStellarError } from "@/lib/errors/stellar-errors";
import { enqueueOfflineAction } from "@/lib/offline-support";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toI128, calculateEstimatedShares } from "@/lib/soroban-i128";
import axios from "@/lib/api-client";
import { ArrowUpRight, Wallet } from "lucide-react";

interface DepositModalVault {
  id: string;
  name: string;
  asset: string;
  walletBalance: string;
  tvl: number | string;
  balance?: number | string;
  apy?: number;
  cropCycle?: { yieldRate: number };
  totalAssets?: number;
  totalShares?: number;
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
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived values — update in real time as user types
  const numericAmount = parseFloat(amount) || 0;
  const i128Value = toI128(numericAmount);
  const walletBalanceNum = parseFloat(vault?.walletBalance ?? "0") || 0;
  const isOverBalance = numericAmount > walletBalanceNum && numericAmount > 0;
  const isValid = numericAmount > 0 && !isOverBalance;

  const estimatedShares = useMemo(
    () =>
      calculateEstimatedShares(
        numericAmount,
        vault?.totalAssets ?? 0,
        vault?.totalShares ?? 0,
      ),
    [numericAmount, vault?.totalAssets, vault?.totalShares],
  );

  const handleDeposit = async () => {
    if (!vault) {
      setError("Please select a vault");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (isOverBalance) {
      setError(`Amount exceeds wallet balance of ${vault.walletBalance} ${vault.asset}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const i128Amount = Number(toI128(Number(amount)));

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueueOfflineAction({
          type: "deposit",
          endpoint: `http://localhost:3001/api/v1/farm-vaults/${vault.id}/deposit`,
          payload: { amount: i128Amount },
        });
        onSuccess?.();
        onDepositSuccess?.(vault.id, Number(amount));
        onClose();
        setAmount("");
        return;
      }

      await axios.post(
        `http://localhost:3001/api/v1/farm-vaults/${vault.id}/deposit`,
        { amount: i128Amount },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      onSuccess?.();
      onDepositSuccess?.(vault.id, Number(amount));
      onClose();
      setAmount("");
    } catch (err: any) {
      console.error("Deposit failed:", err);
      const parsed = parseStellarError(err);
      setError(parsed.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader title={t("modals.deposit_title")} onClose={onClose} />
      <ModalBody>
        <Stack gap="lg">
          <div className="flex items-center justify-between rounded-xl border border-harvest-green-100 bg-harvest-green-50 p-4">
            <div>
              <p className="text-xs font-semibold text-harvest-green-700 uppercase tracking-wider">
                {t("modals.active_vault")}
              </p>
              <h4 className="font-bold text-gray-900">{vault?.name}</h4>
            </div>
            <Badge variant="success">
              {t("common.apy")}:{" "}
              {vault?.apy ?? vault?.cropCycle?.yieldRate ?? 0}%
            </Badge>
          </div>

          {isOverBalance && (
            <Alert
              variant="error"
              description={`Amount exceeds your wallet balance of ${vault?.walletBalance} ${vault?.asset}`}
              isClosable
              onClose={() => setError(null)}
            />
          )}

          {error && !isOverBalance && (
            <Alert
              variant="error"
              description={error}
              isClosable
              onClose={() => setError(null)}
            />
          )}

          <Input
            label={t("modals.amount_label")}
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(null);
            }}
            leftIcon={<Wallet className="w-4 h-4 text-gray-400" />}
            error={isOverBalance ? `Exceeds wallet balance (${vault?.walletBalance} ${vault?.asset})` : undefined}
            type="number"
            autoFocus
          />

          {/* i128 hint + estimated shares panel */}
          <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-[#1a3020] p-3 text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-1 flex justify-between">
              <span>{t("modals.current_balance")}:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                ${vault?.balance ?? 0}
              </span>
            </p>
            <p className="flex justify-between">
              <span>{t("modals.est_yield")}:</span>
              <span className="font-bold text-harvest-green-600 dark:text-harvest-green-400">
                +$
                {(
                  ((numericAmount) *
                    (vault?.apy ?? vault?.cropCycle?.yieldRate ?? 0)) /
                  100
                ).toFixed(2)}
              </span>
            </p>

            <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1.5">
              <p className="flex justify-between items-center">
                <span className="text-xs text-gray-400 dark:text-gray-500">Raw value:</span>
                <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                  {numericAmount > 0 ? i128Value.toString() : "0"}
                </span>
              </p>
              <p className="flex justify-between items-center">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Estimated shares received:
                </span>
                <span className="text-xs font-bold text-harvest-green-600 dark:text-harvest-green-400">
                  {numericAmount > 0 ? estimatedShares.toFixed(4) : "0"}
                </span>
              </p>
            </div>

            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              {t("modals.offline_note")}
            </p>
          </div>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
          {t("modals.cancel")}
        </Button>
        <Button
          variant="primary"
          onClick={handleDeposit}
          isLoading={isLoading}
          isDisabled={!isValid || isLoading}
          leftIcon={<ArrowUpRight className="w-4 h-4" />}
        >
          {t("modals.confirm_deposit")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
