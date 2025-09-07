import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './clients.controller';
import { OutletsController } from './outlets.controller';
import { ClientsCachedController } from './clients-cached.controller';
import { ClientsService } from './clients.service';
import { Clients } from '../entities/clients.entity';
import { ClientAssignment } from '../entities/client-assignment.entity';
import { DatabaseResilienceService } from '../config/database-resilience.service';
import { AppCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clients, ClientAssignment]),
    AppCacheModule,
  ],
  controllers: [ClientsController, OutletsController, ClientsCachedController],
  providers: [ClientsService, DatabaseResilienceService],
  exports: [ClientsService],
})
export class ClientsModule {} 