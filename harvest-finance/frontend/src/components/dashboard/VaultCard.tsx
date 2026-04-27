'use client';

import React from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Badge, Stack, Inline, StrategyBadge } from '@/components/ui';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { StrategyType } from '@/types/vault';
import { formatI128 } from '@/lib/soroban-i128';

export interface VaultProps {
  id: string;
  name: string;
  asset: string;
  apy: string;
  tvl: string;
  balance: string;
  walletBalance: string;
  icon: React.ReactNode;
  strategyType?: StrategyType;
  onDeposit: (vaultId: string) => void;
  onWithdraw: (vaultId: string) => void;
  shares?: number | string;
}

export const VaultCard: React.FC<VaultProps> = ({
  id,
  name,
  asset,
  apy,
  tvl,
  balance,
  walletBalance,
  icon,
  strategyType,
  onDeposit,
  onWithdraw,
  shares,
}) => {
  return (
    <Card hoverable className="h-full border border-gray-100 dark:border-[rgba(141,187,85,0.15)]">
      <CardHeader className="pb-2">
        <Stack direction="row" justify="between" align="start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-harvest-green-50 dark:bg-harvest-green-950/30 flex items-center justify-center text-harvest-green-600 dark:text-harvest-green-400">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-50">{name}</h3>
              {strategyType && <StrategyBadge strategyType={strategyType} />}
              <p className="text-sm text-gray-500 dark:text-zinc-400">{asset} Vault</p>
            </div>
          </div>
          <Badge variant="success" isPill className="bg-harvest-green-100 text-harvest-green-800 dark:bg-harvest-green-900/40 dark:text-harvest-green-300">
            {apy} APY
          </Badge>
        </Stack>
      </CardHeader>

      <CardBody>
        <Stack gap="md" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-[#1a3020] rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">TVL</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{tvl}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-[#1a3020] rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">My Balance</p>
              <div className="flex items-baseline gap-1">
                <p className="text-base font-bold text-harvest-green-600 dark:text-harvest-green-400">{balance}</p>
                <span className="text-xs text-gray-400 dark:text-gray-500">{asset}</span>
              </div>
            </div>
            {shares !== undefined && Number(shares) > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-[#1a3020] rounded-lg col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">My Shares</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-base font-bold text-harvest-green-600 dark:text-harvest-green-400">
                    {typeof shares === 'bigint' ? formatI128(shares) : shares}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Wallet className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span>Wallet: {walletBalance} {asset}</span>
          </div>
        </Stack>
      </CardBody>

      <CardFooter divider className="pt-4 mt-6">
        <Button
          variant="primary"
          fullWidth
          leftIcon={<ArrowUpRight className="w-4 h-4" />}
          onClick={() => onDeposit(id)}
          className="bg-harvest-green-600 hover:bg-harvest-green-700 text-white"
        >
          Deposit
        </Button>
        <Button
          variant="outline"
          fullWidth
          leftIcon={<ArrowDownLeft className="w-4 h-4" />}
          onClick={() => onWithdraw(id)}
          className="border-gray-200 dark:border-[rgba(141,187,85,0.25)] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1a3020]"
        >
          Withdraw
        </Button>
      </CardFooter>
    </Card>
  );
};