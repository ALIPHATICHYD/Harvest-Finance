"use client";

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Stack,
  Badge,
  Alert,
} from "@/components/ui";
import { parseStellarError } from "@/lib/errors/stellar-errors";
import { toI128, calculateEstimatedAssets } from "@/lib/soroban-i128";
import { Wallet, ArrowDownLeft, AlertTriangle } from "lucide-react";
import axios from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { enqueueOfflineAction } from "@/lib/offline-support";

interface WithdrawModalVault {
  id: string;
  name: string;
  balance?: number | string;
  totalAssets?: number;
  totalShares?: number;
  projections?: { progressPercentage: number };
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: WithdrawModalVault | null;
  onSuccess?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  vault,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived values — update in real time as user types
  const numericAmount = parseFloat(amount) || 0;
  const i128Value = toI128(numericAmount);
  const vaultBalanceNum = parseFloat(String(vault?.balance ?? "0")) || 0;
  const isOverBalance = numericAmount > vaultBalanceNum && numericAmount > 0;
  const isValid = numericAmount > 0 && !isOverBalance;

  const estimatedAssets = useMemo(
    () =>
      calculateEstimatedAssets(
        numericAmount,
        vault?.totalAssets ?? 0,
        vault?.totalShares ?? 0,
      ),
    [numericAmount, vault?.totalAssets, vault?.totalShares],
  );

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError(t("modals.valid_amount_error"));
      return;
    }

    if (isOverBalance) {
      setError(t("modals.insufficient_balance"));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const i128Amount = Number(toI128(Number(amount)));

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueueOfflineAction({
          type: "withdraw",
          endpoint: `http://localhost:3001/api/v1/farm-vaults/${vault!.id}/withdraw`,
          payload: { amount: i128Amount },
        });
        onSuccess?.();
        onClose();
        setAmount("");
        return;
      }

      await axios.post(
        `http://localhost:3001/api/v1/farm-vaults/${vault!.id}/withdraw`,
        { amount: i128Amount },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess?.();
      onClose();
      setAmount("");
    } catch (err: any) {
      console.error("Withdraw failed:", err);
      const parsed = parseStellarError(err);
      setError(parsed.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isEarlyWithrawal = (vault?.projections?.progressPercentage || 0) < 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader title={t("modals.withdraw_title")} onClose={onClose} />
      <ModalBody>
        <Stack gap="lg">
          <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
                {t("modals.from_vault")}
              </p>
              <h4 className="font-bold text-gray-900">{vault?.name}</h4>
            </div>
            <Badge variant="error">
              {t("modals.season_progress", {
                progress: vault?.projections?.progressPercentage ?? 0,
              })}
            </Badge>
          </div>

          {isOverBalance && (
            <Alert
              variant="error"
              description={`Amount exceeds your vault balance of $${vault?.balance ?? "0.00"}`}
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
            error={isOverBalance ? `Exceeds vault balance ($${vault?.balance ?? "0.00"})` : undefined}
            type="number"
            autoFocus
          />

          {/* i128 hint + estimated assets panel */}
          <div className="rounded-lg border border-gray-100 bg-gray-50 dark:bg-[#1a3020] p-3 text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-1 flex justify-between">
              <span>{t("modals.available_balance")}:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                ${vault?.balance ?? "0.00"}
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
                  Estimated assets received:
                </span>
                <span className="text-xs font-bold text-harvest-green-600 dark:text-harvest-green-400">
                  {numericAmount > 0 ? estimatedAssets.toFixed(4) : "0"}
                </span>
              </p>
            </div>

            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              {t("modals.offline_note")}
            </p>
          </div>

          {isEarlyWithrawal && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed text-amber-800">
                {t("modals.early_withdrawal_warning")}
              </p>
            </div>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
          {t("modals.cancel")}
        </Button>
        <Button
          variant="danger"
          onClick={handleWithdraw}
          isLoading={isLoading}
          isDisabled={!isValid || isLoading}
          leftIcon={<ArrowDownLeft className="w-4 h-4" />}
        >
          {t("modals.confirm_withdraw")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
