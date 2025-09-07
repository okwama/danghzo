import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class DashboardCacheService {
  private readonly logger = new Logger(DashboardCacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Dashboard Statistics Cache Keys
  private readonly DASHBOARD_STATS_KEY = 'dashboard:stats';
  private readonly DASHBOARD_CHARTS_KEY = 'dashboard:charts';
  private readonly DASHBOARD_METRICS_KEY = 'dashboard:metrics';
  private readonly DASHBOARD_RECENT_ORDERS_KEY = 'dashboard:recent_orders';

  // Cache TTL values (in seconds)
  private readonly STATS_TTL = 300; // 5 minutes
  private readonly CHARTS_TTL = 600; // 10 minutes
  private readonly METRICS_TTL = 300; // 5 minutes
  private readonly RECENT_ORDERS_TTL = 180; // 3 minutes

  /**
   * Cache dashboard statistics
   */
  async cacheDashboardStats(stats: any): Promise<void> {
    try {
      await this.cacheManager.set(
        this.DASHBOARD_STATS_KEY,
        stats,
        this.STATS_TTL
      );
      this.logger.log('Dashboard stats cached successfully');
    } catch (error) {
      this.logger.error('Failed to cache dashboard stats:', error);
    }
  }

  /**
   * Get cached dashboard statistics
   */
  async getCachedDashboardStats(): Promise<any | null> {
    try {
      const cached = await this.cacheManager.get(this.DASHBOARD_STATS_KEY);
      if (cached) {
        this.logger.log('Dashboard stats retrieved from cache');
      }
      return cached;
    } catch (error) {
      this.logger.error('Failed to get cached dashboard stats:', error);
      return null;
    }
  }

  /**
   * Cache dashboard charts data
   */
  async cacheDashboardCharts(chartsData: any): Promise<void> {
    try {
      await this.cacheManager.set(
        this.DASHBOARD_CHARTS_KEY,
        chartsData,
        this.CHARTS_TTL
      );
      this.logger.log('Dashboard charts cached successfully');
    } catch (error) {
      this.logger.error('Failed to cache dashboard charts:', error);
    }
  }

  /**
   * Get cached dashboard charts data
   */
  async getCachedDashboardCharts(): Promise<any | null> {
    try {
      const cached = await this.cacheManager.get(this.DASHBOARD_CHARTS_KEY);
      if (cached) {
        this.logger.log('Dashboard charts retrieved from cache');
      }
      return cached;
    } catch (error) {
      this.logger.error('Failed to get cached dashboard charts:', error);
      return null;
    }
  }

  /**
   * Cache dashboard metrics
   */
  async cacheDashboardMetrics(metrics: any): Promise<void> {
    try {
      await this.cacheManager.set(
        this.DASHBOARD_METRICS_KEY,
        metrics,
        this.METRICS_TTL
      );
      this.logger.log('Dashboard metrics cached successfully');
    } catch (error) {
      this.logger.error('Failed to cache dashboard metrics:', error);
    }
  }

  /**
   * Get cached dashboard metrics
   */
  async getCachedDashboardMetrics(): Promise<any | null> {
    try {
      const cached = await this.cacheManager.get(this.DASHBOARD_METRICS_KEY);
      if (cached) {
        this.logger.log('Dashboard metrics retrieved from cache');
      }
      return cached;
    } catch (error) {
      this.logger.error('Failed to get cached dashboard metrics:', error);
      return null;
    }
  }

  /**
   * Cache recent orders for dashboard
   */
  async cacheRecentOrders(orders: any[]): Promise<void> {
    try {
      await this.cacheManager.set(
        this.DASHBOARD_RECENT_ORDERS_KEY,
        orders,
        this.RECENT_ORDERS_TTL
      );
      this.logger.log('Recent orders cached successfully');
    } catch (error) {
      this.logger.error('Failed to cache recent orders:', error);
    }
  }

  /**
   * Get cached recent orders
   */
  async getCachedRecentOrders(): Promise<any[] | null> {
    try {
      const cached = await this.cacheManager.get(this.DASHBOARD_RECENT_ORDERS_KEY);
      if (cached) {
        this.logger.log('Recent orders retrieved from cache');
      }
      return cached as any[] | null;
    } catch (error) {
      this.logger.error('Failed to get cached recent orders:', error);
      return null;
    }
  }

  /**
   * Invalidate all dashboard cache
   */
  async invalidateDashboardCache(): Promise<void> {
    try {
      await Promise.all([
        this.cacheManager.del(this.DASHBOARD_STATS_KEY),
        this.cacheManager.del(this.DASHBOARD_CHARTS_KEY),
        this.cacheManager.del(this.DASHBOARD_METRICS_KEY),
        this.cacheManager.del(this.DASHBOARD_RECENT_ORDERS_KEY),
      ]);
      this.logger.log('Dashboard cache invalidated successfully');
    } catch (error) {
      this.logger.error('Failed to invalidate dashboard cache:', error);
    }
  }

  /**
   * Invalidate specific dashboard cache
   */
  async invalidateSpecificCache(cacheKey: string): Promise<void> {
    try {
      await this.cacheManager.del(cacheKey);
      this.logger.log(`Cache key ${cacheKey} invalidated successfully`);
    } catch (error) {
      this.logger.error(`Failed to invalidate cache key ${cacheKey}:`, error);
    }
  }
}
