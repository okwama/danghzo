import { AnalyticsService } from './analytics.service';
import { DashboardCacheService } from '../cache/dashboard-cache.service';
export declare class AnalyticsCachedController {
    private readonly analyticsService;
    private readonly dashboardCacheService;
    private readonly logger;
    constructor(analyticsService: AnalyticsService, dashboardCacheService: DashboardCacheService);
    getDashboardStats(query: any): Promise<{
        success: boolean;
        data: any;
        fromCache: boolean;
        timestamp: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        timestamp: string;
        data?: undefined;
        fromCache?: undefined;
    }>;
    getDashboardCharts(query: any): Promise<{
        success: boolean;
        data: any;
        fromCache: boolean;
        timestamp: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        timestamp: string;
        data?: undefined;
        fromCache?: undefined;
    }>;
    getDashboardMetrics(query: any): Promise<{
        success: boolean;
        data: any;
        fromCache: boolean;
        timestamp: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        timestamp: string;
        data?: undefined;
        fromCache?: undefined;
    }>;
    getRecentOrders(query: any): Promise<{
        success: boolean;
        data: any[];
        fromCache: boolean;
        timestamp: string;
        error?: undefined;
    } | {
        success: boolean;
        data: {
            loginStats: {
                totalSessions: number;
                totalDuration: number;
                averageDuration: number;
                activeDays: number;
            };
            journeyStats: {
                totalJourneys: number;
                completedJourneys: number;
                pendingJourneys: number;
                checkInRate: number;
            };
            salesStats: {
                totalSales: number;
                totalAmount: number;
                averageAmount: number;
                completedSales: number;
                pendingSales: number;
            };
            reportStats: {
                totalReports: number;
                productReports: number;
                feedbackReports: number;
                visibilityReports: number;
            };
        };
        fromCache: boolean;
        timestamp: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        timestamp: string;
        data?: undefined;
        fromCache?: undefined;
    }>;
    invalidateDashboardCache(): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        timestamp: string;
        message?: undefined;
    }>;
    getDailyLoginHours(userId: string, query: any): Promise<{
        success: boolean;
        data: {};
        timestamp: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        timestamp: string;
        data?: undefined;
    }>;
    getDailyJourneyVisits(userId: string, query: any): Promise<{
        success: boolean;
        data: {};
        timestamp: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        timestamp: string;
        data?: undefined;
    }>;
}
