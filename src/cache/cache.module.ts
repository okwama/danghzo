import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getCacheConfig } from '../config/cache.config';
import { DashboardCacheService } from './dashboard-cache.service';
import { DataCacheService } from './data-cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getCacheConfig(configService),
      inject: [ConfigService],
    }),
  ],
  providers: [DashboardCacheService, DataCacheService],
  exports: [DashboardCacheService, DataCacheService],
})
export class AppCacheModule {}
