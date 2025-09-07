"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DashboardCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardCacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
let DashboardCacheService = DashboardCacheService_1 = class DashboardCacheService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(DashboardCacheService_1.name);
        this.DASHBOARD_STATS_KEY = 'dashboard:stats';
        this.DASHBOARD_CHARTS_KEY = 'dashboard:charts';
        this.DASHBOARD_METRICS_KEY = 'dashboard:metrics';
        this.DASHBOARD_RECENT_ORDERS_KEY = 'dashboard:recent_orders';
        this.STATS_TTL = 300;
        this.CHARTS_TTL = 600;
        this.METRICS_TTL = 300;
        this.RECENT_ORDERS_TTL = 180;
    }
    async cacheDashboardStats(stats) {
        try {
            await this.cacheManager.set(this.DASHBOARD_STATS_KEY, stats, this.STATS_TTL);
            this.logger.log('Dashboard stats cached successfully');
        }
        catch (error) {
            this.logger.error('Failed to cache dashboard stats:', error);
        }
    }
    async getCachedDashboardStats() {
        try {
            const cached = await this.cacheManager.get(this.DASHBOARD_STATS_KEY);
            if (cached) {
                this.logger.log('Dashboard stats retrieved from cache');
            }
            return cached;
        }
        catch (error) {
            this.logger.error('Failed to get cached dashboard stats:', error);
            return null;
        }
    }
    async cacheDashboardCharts(chartsData) {
        try {
            await this.cacheManager.set(this.DASHBOARD_CHARTS_KEY, chartsData, this.CHARTS_TTL);
            this.logger.log('Dashboard charts cached successfully');
        }
        catch (error) {
            this.logger.error('Failed to cache dashboard charts:', error);
        }
    }
    async getCachedDashboardCharts() {
        try {
            const cached = await this.cacheManager.get(this.DASHBOARD_CHARTS_KEY);
            if (cached) {
                this.logger.log('Dashboard charts retrieved from cache');
            }
            return cached;
        }
        catch (error) {
            this.logger.error('Failed to get cached dashboard charts:', error);
            return null;
        }
    }
    async cacheDashboardMetrics(metrics) {
        try {
            await this.cacheManager.set(this.DASHBOARD_METRICS_KEY, metrics, this.METRICS_TTL);
            this.logger.log('Dashboard metrics cached successfully');
        }
        catch (error) {
            this.logger.error('Failed to cache dashboard metrics:', error);
        }
    }
    async getCachedDashboardMetrics() {
        try {
            const cached = await this.cacheManager.get(this.DASHBOARD_METRICS_KEY);
            if (cached) {
                this.logger.log('Dashboard metrics retrieved from cache');
            }
            return cached;
        }
        catch (error) {
            this.logger.error('Failed to get cached dashboard metrics:', error);
            return null;
        }
    }
    async cacheRecentOrders(orders) {
        try {
            await this.cacheManager.set(this.DASHBOARD_RECENT_ORDERS_KEY, orders, this.RECENT_ORDERS_TTL);
            this.logger.log('Recent orders cached successfully');
        }
        catch (error) {
            this.logger.error('Failed to cache recent orders:', error);
        }
    }
    async getCachedRecentOrders() {
        try {
            const cached = await this.cacheManager.get(this.DASHBOARD_RECENT_ORDERS_KEY);
            if (cached) {
                this.logger.log('Recent orders retrieved from cache');
            }
            return cached;
        }
        catch (error) {
            this.logger.error('Failed to get cached recent orders:', error);
            return null;
        }
    }
    async invalidateDashboardCache() {
        try {
            await Promise.all([
                this.cacheManager.del(this.DASHBOARD_STATS_KEY),
                this.cacheManager.del(this.DASHBOARD_CHARTS_KEY),
                this.cacheManager.del(this.DASHBOARD_METRICS_KEY),
                this.cacheManager.del(this.DASHBOARD_RECENT_ORDERS_KEY),
            ]);
            this.logger.log('Dashboard cache invalidated successfully');
        }
        catch (error) {
            this.logger.error('Failed to invalidate dashboard cache:', error);
        }
    }
    async invalidateSpecificCache(cacheKey) {
        try {
            await this.cacheManager.del(cacheKey);
            this.logger.log(`Cache key ${cacheKey} invalidated successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to invalidate cache key ${cacheKey}:`, error);
        }
    }
};
exports.DashboardCacheService = DashboardCacheService;
exports.DashboardCacheService = DashboardCacheService = DashboardCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], DashboardCacheService);
//# sourceMappingURL=dashboard-cache.service.js.map