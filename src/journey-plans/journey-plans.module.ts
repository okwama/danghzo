import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JourneyPlansController } from './journey-plans.controller';
import { JourneyPlansService } from './journey-plans.service';
import { JourneyPlan } from './entities/journey-plan.entity';
import { Clients } from '../entities/clients.entity';
import { SalesRep } from '../entities/sales-rep.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([JourneyPlan, Clients, SalesRep])],
  controllers: [JourneyPlansController],
  providers: [JourneyPlansService, CloudinaryService],
  exports: [JourneyPlansService],
})
export class JourneyPlansModule {} 