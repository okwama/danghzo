import { Repository, DataSource } from 'typeorm';
import { FeedbackReport } from '../entities/feedback-report.entity';
import { ProductReport } from '../entities/product-report.entity';
import { VisibilityReport } from '../entities/visibility-report.entity';
export declare class ReportsService {
    private feedbackReportRepository;
    private productReportRepository;
    private visibilityReportRepository;
    private dataSource;
    constructor(feedbackReportRepository: Repository<FeedbackReport>, productReportRepository: Repository<ProductReport>, visibilityReportRepository: Repository<VisibilityReport>, dataSource: DataSource);
    submitReport(reportData: any, authenticatedUserId?: number): Promise<any>;
    getReportsByJourneyPlan(journeyPlanId: number, options?: {
        limit?: number;
        offset?: number;
        includeRelations?: boolean;
        date?: Date;
    }): Promise<any>;
    getTodayReportsByJourneyPlan(journeyPlanId: number, options?: {
        limit?: number;
        offset?: number;
        includeRelations?: boolean;
    }): Promise<any>;
    findAll(options?: {
        limit?: number;
        offset?: number;
        includeRelations?: boolean;
        userId?: number;
        clientId?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<any>;
    getReportCounts(journeyPlanId?: number): Promise<any>;
    getVisitsByDate(date: string, userId: number): Promise<any>;
    getWeeklyVisits(userId: number, weekStart: Date): Promise<{
        [date: string]: any[];
    }>;
    private bulkInsertProductReports;
}
