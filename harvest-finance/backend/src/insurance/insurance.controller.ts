import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InsuranceService } from './insurance.service';
import { RiskAssessmentDto, SubscribeInsuranceDto } from './dto/insurance.dto';

@Controller('insurance')
@UseGuards(JwtAuthGuard)
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  /**
   * GET /insurance/plans
   * Returns all active insurance plans.
   */
  @Get('plans')
  getPlans() {
    return this.insuranceService.getAvailablePlans();
  }

  /**
   * GET /insurance/assess?userId=&cropType=&season=&...
   * Quick risk assessment without saving anything.
   */
  @Get('assess')
  assess(@Query() dto: RiskAssessmentDto) {
    return this.insuranceService.assessRisk(dto);
  }

  /**
   * GET /insurance/recommendations?cropType=&season=&...
   * Returns risk assessment + ranked plan matches for the authenticated user.
   */
  @Get('recommendations')
  getRecommendations(@Req() _req: any, @Query() dto: RiskAssessmentDto) {
    return this.insuranceService.getRecommendations(dto);
  }

  /**
   * GET /insurance/subscriptions
   * Returns the authenticated user's active and past insurance subscriptions.
   */
  @Get('subscriptions')
  getSubscriptions(@Req() req: any) {
    const userId: string = req.user?.userId ?? req.user?.id;
    return this.insuranceService.getUserSubscriptions(userId);
  }

  /**
   * POST /insurance/subscribe
   * Subscribe to an insurance plan and optionally link a Farm Vault for premium tracking.
   */
  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  subscribe(@Req() req: any, @Body() dto: SubscribeInsuranceDto) {
    const userId: string = req.user?.userId ?? req.user?.id;
    return this.insuranceService.subscribe(userId, dto);
  }

  /**
   * POST /insurance/renewal-alerts  (admin / cron trigger)
   * Sends renewal reminder notifications for subscriptions expiring within 30 days.
   */
  @Post('renewal-alerts')
  @HttpCode(HttpStatus.OK)
  sendRenewalAlerts() {
    return this.insuranceService.sendRenewalAlerts().then((count) => ({
      alertsSent: count,
    }));
  }
}
