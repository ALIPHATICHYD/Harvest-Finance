import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('vaults')
  @ApiOperation({ summary: 'Get vault-level metrics' })
  getVaultMetrics() {
    return this.analyticsService.getVaultMetrics();
  }

  @Get('system')
  @ApiOperation({ summary: 'Get system-level metrics (uptime, request counts)' })
  getSystemMetrics() {
    return this.analyticsService.getSystemMetrics();
  }
}
