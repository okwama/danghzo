import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { getDatabaseConfig } from './config/database.config';
import { DatabaseHealthService } from './config/database-health.service';
import { DatabaseResilienceService } from './config/database-resilience.service';
import { DatabaseMonitorController } from './config/database-monitor.controller';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { TargetsModule } from './targets/targets.module';
import { JourneyPlansModule } from './journey-plans/journey-plans.module';
import { NoticesModule } from './notices/notices.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TasksModule } from './tasks/tasks.module';
import { UploadsModule } from './uploads/uploads.module';
import { UpliftSalesModule } from './uplift-sales/uplift-sales.module';
import { CheckinModule } from './checkin/checkin.module';
import { LeaveModule } from './leave/leave.module';
import { ExcelImportModule } from './excel-import/excel-import.module';
import { ClockInOutModule } from './clock-in-out/clock-in-out.module';
import { ReportsModule } from './reports/reports.module';
import { RoutesModule } from './routes/routes.module';
import { VersionModule } from './version/version.module';
import { PaymentsModule } from './payments/payments.module';
import { AppCacheModule } from './cache/cache.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'woosh-secret-key'),
        signOptions: { expiresIn: '9h' },
      }),
      inject: [ConfigService],
    }),
    MulterModule.register({
      storage: require('multer').memoryStorage(),
    }),
    ScheduleModule.forRoot(),
    PassportModule,
    AppCacheModule,
    AuthModule,
    UsersModule,
    ProfileModule,
    ClientsModule,
    ProductsModule,
    OrdersModule,
    TargetsModule,
    JourneyPlansModule,
    NoticesModule,
    AnalyticsModule,
    TasksModule,
    UploadsModule,
    UpliftSalesModule,
    CheckinModule,
    LeaveModule,
    ExcelImportModule,
    ClockInOutModule,
    ReportsModule,
    RoutesModule,
    VersionModule,
    PaymentsModule,
  ],
  controllers: [AppController, DatabaseMonitorController],
  providers: [DatabaseHealthService, DatabaseResilienceService],
})
export class AppModule {} 