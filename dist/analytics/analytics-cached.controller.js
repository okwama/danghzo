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
var AnalyticsCachedController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsCachedController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const analytics_service_1 = require("./analytics.service");
const dashboard_cache_service_1 = require("../cache/dashboard-cache.service");
let AnalyticsCachedController = AnalyticsCachedController_1 = class AnalyticsCachedController {
    constructor(analyticsService, dashboardCacheService) {
        this.analyticsService = analyticsService;
        this.dashboardCacheService = dashboardCacheService;
        this.logger = new common_1.Logger(AnalyticsCachedController_1.name);
    }
    async getDashboardStats(query) {
        try {
            const cachedStats = await this.dashboardCacheService.getCachedDashboardStats();
            if (cachedStats) {
                this.logger.log('Dashboard stats served from cache');
                return {
                    success: true,
                    data: cachedStats,
                    fromCache: true,
                    timestamp: new Date().toISOString(),
                };
            }
            this.logger.log('Fetching dashboard stats from database');
            const stats = await this.analyticsService.findAll(query);
            await this.dashboardCacheService.cacheDashboardStats(stats);
            return {
                success: true,
                data: stats,
                fromCache: false,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error fetching dashboard stats:', error);
            return {
                success: false,
                error: 'Failed to fetch dashboard statistics',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getDashboardCharts(query) {
        try {
            const cachedCharts = await this.dashboardCacheService.getCachedDashboardCharts();
            if (cachedCharts) {
                this.logger.log('Dashboard charts served from cache');
                return {
                    success: true,
                    data: cachedCharts,
                    fromCache: true,
                    timestamp: new Date().toISOString(),
                };
            }
            this.logger.log('Fetching dashboard charts from database');
            const charts = await this.analyticsService.findAll(query);
            await this.dashboardCacheService.cacheDashboardCharts(charts);
            return {
                success: true,
                data: charts,
                fromCache: false,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error fetching dashboard charts:', error);
            return {
                success: false,
                error: 'Failed to fetch dashboard charts',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getDashboardMetrics(query) {
        try {
            const cachedMetrics = await this.dashboardCacheService.getCachedDashboardMetrics();
            if (cachedMetrics) {
                this.logger.log('Dashboard metrics served from cache');
                return {
                    success: true,
                    data: cachedMetrics,
                    fromCache: true,
                    timestamp: new Date().toISOString(),
                };
            }
            this.logger.log('Fetching dashboard metrics from database');
            const metrics = await this.analyticsService.findAll(query);
            await this.dashboardCacheService.cacheDashboardMetrics(metrics);
            return {
                success: true,
                data: metrics,
                fromCache: false,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error fetching dashboard metrics:', error);
            return {
                success: false,
                error: 'Failed to fetch dashboard metrics',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getRecentOrders(query) {
        try {
            const cachedOrders = await this.dashboardCacheService.getCachedRecentOrders();
            if (cachedOrders) {
                this.logger.log('Recent orders served from cache');
                return {
                    success: true,
                    data: cachedOrders,
                    fromCache: true,
                    timestamp: new Date().toISOString(),
                };
            }
            this.logger.log('Fetching recent orders from database');
            const orders = await this.analyticsService.findAll(query);
            const ordersArray = Array.isArray(orders) ? orders : [orders];
            await this.dashboardCacheService.cacheRecentOrders(ordersArray);
            return {
                success: true,
                data: orders,
                fromCache: false,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error fetching recent orders:', error);
            return {
                success: false,
                error: 'Failed to fetch recent orders',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async invalidateDashboardCache() {
        try {
            await this.dashboardCacheService.invalidateDashboardCache();
            this.logger.log('Dashboard cache invalidated successfully');
            return {
                success: true,
                message: 'Dashboard cache invalidated successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error invalidating dashboard cache:', error);
            return {
                success: false,
                error: 'Failed to invalidate dashboard cache',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getDailyLoginHours(userId, query) {
        try {
            const result = await this.analyticsService.getDailyLoginHours(+userId, query);
            return {
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error fetching daily login hours:', error);
            return {
                success: false,
                error: 'Failed to fetch daily login hours',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getDailyJourneyVisits(userId, query) {
        try {
            const result = await this.analyticsService.getDailyJourneyVisits(+userId, query);
            return {
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error fetching daily journey visits:', error);
            return {
                success: false,
                error: 'Failed to fetch daily journey visits',
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.AnalyticsCachedController = AnalyticsCachedController;
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsCachedController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('dashboard/charts'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsCachedController.prototype, "getDashboardCharts", null);
__decorate([
    (0, common_1.Get)('dashboard/metrics'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsCachedController.prototype, "getDashboardMetrics", null);
__decorate([
    (0, common_1.Get)('dashboard/recent-orders'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsCachedController.prototype, "getRecentOrders", null);
__decorate([
    (0, common_1.Get)('dashboard/invalidate-cache'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsCachedController.prototype, "invalidateDashboardCache", null);
__decorate([
    (0, common_1.Get)('daily-login-hours/:userId'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsCachedController.prototype, "getDailyLoginHours", null);
__decorate([
    (0, common_1.Get)('daily-journey-visits/:userId'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsCachedController.prototype, "getDailyJourneyVisits", null);
exports.AnalyticsCachedController = AnalyticsCachedController = AnalyticsCachedController_1 = __decorate([
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        dashboard_cache_service_1.DashboardCacheService])
], AnalyticsCachedController);
//# sourceMappingURL=analytics-cached.controller.js.map