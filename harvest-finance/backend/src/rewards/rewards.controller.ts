import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RewardsService } from './rewards.service';

@Controller('users/:userId/rewards')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  getUserRewards(@Param('userId') userId: string) {
    return this.rewardsService.getUserRewards(userId);
  }

  @Post('claim')
  claimRewards(
    @Param('userId') userId: string,
    @Query('vaultId') vaultId?: string,
  ) {
    return this.rewardsService.claimRewards(userId, vaultId);
  }
}
