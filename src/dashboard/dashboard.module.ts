import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule, CacheModule.register({ ttl: 60 })],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [],
})
export class DashboardModule {}
