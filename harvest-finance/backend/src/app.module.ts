import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { buildThrottlerOptions } from './common/config/throttler.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VaultsModule } from './vaults/vaults.module';
import { FarmIntelligenceModule } from './farm-intelligence/farm-intelligence.module';
import { AchievementsModule } from './achievements/achievements.module';
import { RewardsModule } from './rewards/rewards.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ExportModule } from './export/export.module';
import { FarmVaultsModule } from './farm-vaults/farm-vaults.module';
import { InsuranceModule } from './insurance/insurance.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { LoggerModule } from './logger/logger.module';
import { OrdersModule } from './orders/orders.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { RealtimeModule } from './realtime/realtime.module';
import { SorobanModule } from './soroban/soroban.module';
import { StellarModule } from './stellar/stellar.module';
import { VerificationModule } from './verification/verification.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { StateSyncModule } from './state-sync/state-sync.module';
import {
  Achievement,
  CreditScore,
  Deposit,
  FarmVault,
  Notification,
  Order,
  Reward,
  SorobanEvent,
  Transaction,
  User,
  Vault,
  VaultDeposit,
  Verification,
  Withdrawal,
  YieldAnalytics,
} from './database/entities';
import { CropCycle } from './database/entities/crop-cycle.entity';
import { InsurancePlan } from './database/entities/insurance-plan.entity';
import { InsuranceSubscription } from './database/entities/insurance-subscription.entity';
import { CreateInitialSchema1700000000000 } from './database/migrations/1700000000000-CreateInitialSchema';
import { CreateAchievements1700000000004 } from './database/migrations/1700000000004-CreateAchievements';
import { CreateRewards1700000000005 } from './database/migrations/1700000000005-CreateRewards';
import { CreateNotifications1700000000006 } from './database/migrations/1700000000006-CreateNotifications';
import { CreateWithdrawals1700000000007 } from './database/migrations/1700000000007-CreateWithdrawals';
import { CreateFarmVaults1700000000008 } from './database/migrations/1700000000008-CreateFarmVaults';
import { CreateInsurance1700000000009 } from './database/migrations/1700000000009-CreateInsurance';
import { AddInsuranceNotificationType1700000000010 } from './database/migrations/1700000000010-AddInsuranceNotificationType';
import { CreateSorobanEvents1700000000011 } from './database/migrations/1700000000011-CreateSorobanEvents';
import { CreateYieldAnalytics1700000000012 } from './database/migrations/1700000000012-CreateYieldAnalytics';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: buildThrottlerOptions,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User,
          Order,
          Transaction,
          Verification,
          CreditScore,
          Vault,
          VaultDeposit,
          Deposit,
          Achievement,
          Reward,
          Notification,
          Withdrawal,
          CropCycle,
          FarmVault,
          InsurancePlan,
          InsuranceSubscription,
          SorobanEvent,
          YieldAnalytics,
        ],
        migrations: [
          CreateInitialSchema1700000000000,
          CreateAchievements1700000000004,
          CreateRewards1700000000005,
          CreateNotifications1700000000006,
          CreateWithdrawals1700000000007,
          CreateFarmVaults1700000000008,
          CreateInsurance1700000000009,
          AddInsuranceNotificationType1700000000010,
          CreateSorobanEvents1700000000011,
          CreateYieldAnalytics1700000000012,
        ],
        synchronize: false,
        migrationsRun: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({ isGlobal: true, ttl: 600, max: 100 }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    VaultsModule,
    HealthModule,
    OrdersModule,
    VerificationModule,
    DatabaseModule,
    FarmIntelligenceModule,
    AchievementsModule,
    RewardsModule,
    NotificationsModule,
    AdminModule,
    ExportModule,
    FarmVaultsModule,
    InsuranceModule,
    RealtimeModule,
    LoggerModule,
    StellarModule,
    SorobanModule,
    PortfolioModule,
    AnalyticsModule,
    StateSyncModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
