import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vault } from '../database/entities/vault.entity';
import { Deposit } from '../database/entities/deposit.entity';
import { AuthModule } from '../auth/auth.module';
import { FarmIntelligenceController } from './farm-intelligence.controller';
import { SavingsProjectionService } from './services/savings-projection.service';
import { BudgetRecommendationService } from './services/budget-recommendation.service';
import { AlertsService } from './services/alerts.service';
import { HistoricalAnalyticsService } from './services/historical-analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vault, Deposit]), AuthModule],
  controllers: [FarmIntelligenceController],
  providers: [
    SavingsProjectionService,
    BudgetRecommendationService,
    AlertsService,
    HistoricalAnalyticsService,
  ],
  exports: [AlertsService],
})
export class FarmIntelligenceModule {}
