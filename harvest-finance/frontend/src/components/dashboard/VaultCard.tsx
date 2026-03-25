"use client";

import React from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface VaultProps {
  id: string;
  name: string;
  tokenSymbol: string;
  apy: number;
  tvl: string;
  icon?: React.ReactNode;
}

export function VaultCard({ vault }: { vault: VaultProps }) {
  return (
    <Card
      hoverable
      className="h-full flex flex-col transition-all hover:-translate-y-1 bg-white"
    >
      <CardHeader
        title={vault.name}
        subtitle={`Token: ${vault.tokenSymbol}`}
        className="pb-2"
        action={
          <div className="w-10 h-10 rounded-full bg-harvest-green-50 flex items-center justify-center text-harvest-green-600 border border-harvest-green-100 shadow-sm">
            {vault.icon || (
              <span className="font-bold text-sm">{vault.tokenSymbol[0]}</span>
            )}
          </div>
        }
      />
      <CardBody className="py-2">
        <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              APY
            </p>
            <p className="text-xl font-bold text-harvest-green-600">
              {vault.apy}%
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              TVL
            </p>
            <p className="text-xl font-bold text-gray-900">{vault.tvl}</p>
          </div>
        </div>
      </CardBody>
      <CardFooter divider className="mt-auto justify-between gap-3 pt-4">
        <Button variant="outline" size="sm" fullWidth>
          Withdraw
        </Button>
        <Button variant="primary" size="sm" fullWidth>
          Deposit
        </Button>
      </CardFooter>
    </Card>
  );
}
