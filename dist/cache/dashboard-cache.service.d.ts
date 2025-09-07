import { Cache } from 'cache-manager';
export declare class DashboardCacheService {
    private cacheManager;
    private readonly logger;
    constructor(cacheManager: Cache);
    private readonly DASHBOARD_STATS_KEY;
    private readonly DASHBOARD_CHARTS_KEY;
    private readonly DASHBOARD_METRICS_KEY;
    private readonly DASHBOARD_RECENT_ORDERS_KEY;
    private readonly STATS_TTL;
    private readonly CHARTS_TTL;
    private readonly METRICS_TTL;
    private readonly RECENT_ORDERS_TTL;
    cacheDashboardStats(stats: any): Promise<void>;
    getCachedDashboardStats(): Promise<any | null>;
    cacheDashboardCharts(chartsData: any): Promise<void>;
    getCachedDashboardCharts(): Promise<any | null>;
    cacheDashboardMetrics(metrics: any): Promise<void>;
    getCachedDashboardMetrics(): Promise<any | null>;
    cacheRecentOrders(orders: any[]): Promise<void>;
    getCachedRecentOrders(): Promise<any[] | null>;
    invalidateDashboardCache(): Promise<void>;
    invalidateSpecificCache(cacheKey: string): Promise<void>;
}
