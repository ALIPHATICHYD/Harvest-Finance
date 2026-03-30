'use client';

import React from 'react';
import { Card, CardHeader, CardBody, Button, Badge, Stack, Inline, Section } from '@/components/ui';
import { Wallet, TrendingUp, PieChart, Download, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import axios from '@/lib/api-client';

export default function PortfolioPage() {
  const { user, token } = useAuthStore();
  const [isExporting, setIsExporting] = React.useState<string | null>(null);

  const handleExport = async (format: 'csv' | 'excel') => {
    if (!user) return;
    
    setIsExporting(format);
    try {
      const response = await axios.get(
        `http://localhost:3001/api/v1/export/users/${user.id}/transactions`,
        {
          params: { format },
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'csv' ? 'csv' : 'xlsx';
      link.setAttribute('download', `portfolio_export_${user.name}_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Portfolio
          </h1>
          <p className="text-gray-500 mt-1">
            Track your agricultural investments and yields across all vaults.
          </p>
        </div>
        <Inline gap="md">
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => handleExport('csv')}
            isLoading={isExporting === 'csv'}
          >
            Export History
          </Button>
        </Inline>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="default">
          <CardBody className="p-6">
            <Stack gap="md">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-harvest-green-100 flex items-center justify-center text-harvest-green-600">
                  <Wallet className="w-5 h-5" />
                </div>
                <Badge variant="primary" size="sm">+12.5% APY</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Value Locked</p>
                <p className="text-3xl font-bold text-gray-900">$1,500.00</p>
              </div>
            </Stack>
          </CardBody>
        </Card>

        <Card variant="default">
          <CardBody className="p-6">
            <Stack gap="md">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <Badge variant="success" size="sm">Auto-Compounding</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Accrued Rewards</p>
                <p className="text-3xl font-bold text-gray-900">$42.50</p>
              </div>
            </Stack>
          </CardBody>
        </Card>

        <Card variant="default">
          <CardBody className="p-6">
            <Stack gap="md">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <PieChart className="w-5 h-5" />
                </div>
                <Badge variant="outline" size="sm">3 Vaults</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Asset Allocation</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="h-2 w-1/2 bg-harvest-green-500 rounded-full" />
                  <div className="h-2 w-1/4 bg-blue-500 rounded-full" />
                  <div className="h-2 w-1/4 bg-gray-300 rounded-full" />
                </div>
              </div>
            </Stack>
          </CardBody>
        </Card>
      </div>

      <Section>
        <Card variant="default">
          <CardHeader title="Portfolio Breakdown" />
          <CardBody>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Info className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">
                Detailed portfolio breakdown will be available once you have active deposits.
              </p>
              <Button variant="ghost" className="mt-4" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Go to Vaults
              </Button>
            </div>
          </CardBody>
        </Card>
      </Section>
    </div>
  );
}

const Info = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
