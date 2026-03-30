import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SavingsProjectionService } from './services/savings-projection.service';
import { BudgetRecommendationService } from './services/budget-recommendation.service';
import { AlertsService } from './services/alerts.service';
import { HistoricalAnalyticsService } from './services/historical-analytics.service';

@Controller('farm-intelligence')
@UseGuards(JwtAuthGuard)
export class FarmIntelligenceController {
  constructor(
    private readonly projectionService: SavingsProjectionService,
    private readonly budgetService: BudgetRecommendationService,
    private readonly alertsService: AlertsService,
    private readonly analyticsService: HistoricalAnalyticsService,
  ) {}

  @Get('projection')
  getProjection(
    @Query('userId') userId: string,
    @Query('months') months: string,
  ) {
    return this.projectionService.projectSavings(
      userId,
      parseInt(months || '6', 10),
    );
  }

  @Get('budget')
  getBudget(@Query('userId') userId: string) {
    return this.budgetService.getRecommendation(userId);
  }

  @Get('alerts')
  getAlerts(@Query('userId') userId: string) {
    return this.alertsService.getAlerts(userId);
  }

  @Get('analytics')
  getAnalytics(@Query('userId') userId: string) {
    return this.analyticsService.getAnalytics(userId);
  }
}
