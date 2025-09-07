import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { DashboardCacheService } from '../cache/dashboard-cache.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsCachedController {
  private readonly logger = new Logger(AnalyticsCachedController.name);

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly dashboardCacheService: DashboardCacheService,
  ) {}

  /**
   * Get dashboard statistics with caching
   */
  @Get('dashboard/stats')
  async getDashboardStats(@Query() query: any) {
    try {
      // Try to get from cache first
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

      // If not in cache, fetch from database
      this.logger.log('Fetching dashboard stats from database');
      const stats = await this.analyticsService.findAll(query);
      
      // Cache the result
      await this.dashboardCacheService.cacheDashboardStats(stats);
      
      return {
        success: true,
        data: stats,
        fromCache: false,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        error: 'Failed to fetch dashboard statistics',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get dashboard charts data with caching
   */
  @Get('dashboard/charts')
  async getDashboardCharts(@Query() query: any) {
    try {
      // Try to get from cache first
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

      // If not in cache, fetch from database
      this.logger.log('Fetching dashboard charts from database');
      const charts = await this.analyticsService.findAll(query);
      
      // Cache the result
      await this.dashboardCacheService.cacheDashboardCharts(charts);
      
      return {
        success: true,
        data: charts,
        fromCache: false,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching dashboard charts:', error);
      return {
        success: false,
        error: 'Failed to fetch dashboard charts',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get dashboard metrics with caching
   */
  @Get('dashboard/metrics')
  async getDashboardMetrics(@Query() query: any) {
    try {
      // Try to get from cache first
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

      // If not in cache, fetch from database
      this.logger.log('Fetching dashboard metrics from database');
      const metrics = await this.analyticsService.findAll(query);
      
      // Cache the result
      await this.dashboardCacheService.cacheDashboardMetrics(metrics);
      
      return {
        success: true,
        data: metrics,
        fromCache: false,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching dashboard metrics:', error);
      return {
        success: false,
        error: 'Failed to fetch dashboard metrics',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get recent orders for dashboard with caching
   */
  @Get('dashboard/recent-orders')
  async getRecentOrders(@Query() query: any) {
    try {
      // Try to get from cache first
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

      // If not in cache, fetch from database
      this.logger.log('Fetching recent orders from database');
      const orders = await this.analyticsService.findAll(query);
      
      // Cache the result - convert to array format for recent orders
      const ordersArray = Array.isArray(orders) ? orders : [orders];
      await this.dashboardCacheService.cacheRecentOrders(ordersArray);
      
      return {
        success: true,
        data: orders,
        fromCache: false,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching recent orders:', error);
      return {
        success: false,
        error: 'Failed to fetch recent orders',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Invalidate dashboard cache (admin endpoint)
   */
  @Get('dashboard/invalidate-cache')
  async invalidateDashboardCache() {
    try {
      await this.dashboardCacheService.invalidateDashboardCache();
      this.logger.log('Dashboard cache invalidated successfully');
      return {
        success: true,
        message: 'Dashboard cache invalidated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error invalidating dashboard cache:', error);
      return {
        success: false,
        error: 'Failed to invalidate dashboard cache',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get daily login hours (cached)
   */
  @Get('daily-login-hours/:userId')
  async getDailyLoginHours(@Query('userId') userId: string, @Query() query: any) {
    try {
      const result = await this.analyticsService.getDailyLoginHours(+userId, query);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching daily login hours:', error);
      return {
        success: false,
        error: 'Failed to fetch daily login hours',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get daily journey visits (cached)
   */
  @Get('daily-journey-visits/:userId')
  async getDailyJourneyVisits(@Query('userId') userId: string, @Query() query: any) {
    try {
      const result = await this.analyticsService.getDailyJourneyVisits(+userId, query);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching daily journey visits:', error);
      return {
        success: false,
        error: 'Failed to fetch daily journey visits',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
