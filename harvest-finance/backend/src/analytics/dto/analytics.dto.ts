export class VaultMetricsDto {
  totalVaults: number;
  totalDepositsUsd: number;
  totalWithdrawalsUsd: number;
  activeVaults: number;
  avgUtilizationPct: number;
}

export class SystemMetricsDto {
  uptimeSeconds: number;
  totalApiRequests: number;
  totalErrors: number;
  errorRate: number;
  lastUpdatedAt: string;
}
