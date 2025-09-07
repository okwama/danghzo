import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    submitReport(reportData: any, authenticatedUserId: number): Promise<{
        success: boolean;
        report: {
            id: any;
            type: any;
            journeyPlanId: any;
            userId: number;
            clientId: any;
            createdAt: any;
        };
        specificReport: any;
        message: string;
    } | {
        success: boolean;
        error: any;
    }>;
    getReportsByJourneyPlan(journeyPlanId: number, limit?: number, offset?: number, includeRelations?: string, date?: string): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getTodayReportsByJourneyPlan(journeyPlanId: number, limit?: number, offset?: number, includeRelations?: string): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getVisitsByDate(date: string, authenticatedUserId: number, queryUserId?: number): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getWeeklyVisits(authenticatedUserId: number, queryUserId?: number, weekStart?: string): Promise<{
        success: boolean;
        data: {
            [date: string]: any[];
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    private getWeekStart;
    getReportCounts(journeyPlanId?: number): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getAllReports(limit?: number, offset?: number, includeRelations?: string, userId?: number, clientId?: number, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
}
