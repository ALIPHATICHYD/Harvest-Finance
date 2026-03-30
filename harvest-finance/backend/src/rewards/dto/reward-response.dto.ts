export class VaultRewardSummaryDto {
  vaultId: string;
  vaultName: string;
  totalDeposited: number;
  totalReward: number;
  apy: number;
}

export class UserRewardsResponseDto {
  userId: string;
  totalReward: number;
  byVault: VaultRewardSummaryDto[];
  calculatedAt: string;
}

export class ClaimRewardsResponseDto {
  userId: string;
  vaultId: string | null;
  claimedAmount: number;
  claimedAt: string;
}
