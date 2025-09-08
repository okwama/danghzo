import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PdfExportService } from './pdf-export.service';
import { FeedbackReport } from 'src/entities/feedback-report.entity';
import { ProductReport } from 'src/entities/product-report.entity';
import { VisibilityReport } from 'src/entities/visibility-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeedbackReport,
      ProductReport,
      VisibilityReport,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, PdfExportService],
  exports: [ReportsService, PdfExportService],
})
export class ReportsModule {}
