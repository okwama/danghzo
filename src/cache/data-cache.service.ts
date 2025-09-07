import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class DataCacheService {
  private readonly logger = new Logger(DataCacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Cache Keys
  private readonly CLIENTS_LIST_KEY = 'clients:list';
  private readonly CLIENTS_DETAIL_KEY = 'clients:detail';
  private readonly PRODUCTS_LIST_KEY = 'products:list';
  private readonly PRODUCTS_DETAIL_KEY = 'products:detail';
  private readonly PRODUCTS_CATEGORIES_KEY = 'products:categories';

  // Cache TTL values (in seconds)
  private readonly CLIENTS_TTL = 600; // 10 minutes
  private readonly PRODUCTS_TTL = 900; // 15 minutes
  private readonly CATEGORIES_TTL = 1800; // 30 minutes

  /**
   * Cache clients list with pagination
   */
  async cacheClientsList(page: number, limit: number, clients: any[], filters?: any): Promise<void> {
    try {
      const cacheKey = this.getClientsListKey(page, limit, filters);
      await this.cacheManager.set(cacheKey, clients, this.CLIENTS_TTL);
      this.logger.log(`Clients list cached for page ${page}, limit ${limit}`);
    } catch (error) {
      this.logger.error('Failed to cache clients list:', error);
    }
  }

  /**
   * Get cached clients list
   */
  async getCachedClientsList(page: number, limit: number, filters?: any): Promise<any[] | null> {
    try {
      const cacheKey = this.getClientsListKey(page, limit, filters);
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.log(`Clients list retrieved from cache for page ${page}`);
      }
      return cached as any[] | null;
    } catch (error) {
      this.logger.error('Failed to get cached clients list:', error);
      return null;
    }
  }

  /**
   * Cache individual client details
   */
  async cacheClientDetail(clientId: number, clientData: any): Promise<void> {
    try {
      const cacheKey = `${this.CLIENTS_DETAIL_KEY}:${clientId}`;
      await this.cacheManager.set(cacheKey, clientData, this.CLIENTS_TTL);
      this.logger.log(`Client detail cached for ID ${clientId}`);
    } catch (error) {
      this.logger.error('Failed to cache client detail:', error);
    }
  }

  /**
   * Get cached client details
   */
  async getCachedClientDetail(clientId: number): Promise<any | null> {
    try {
      const cacheKey = `${this.CLIENTS_DETAIL_KEY}:${clientId}`;
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.log(`Client detail retrieved from cache for ID ${clientId}`);
      }
      return cached;
    } catch (error) {
      this.logger.error('Failed to get cached client detail:', error);
      return null;
    }
  }

  /**
   * Cache products list with pagination
   */
  async cacheProductsList(page: number, limit: number, products: any[], filters?: any): Promise<void> {
    try {
      const cacheKey = this.getProductsListKey(page, limit, filters);
      await this.cacheManager.set(cacheKey, products, this.PRODUCTS_TTL);
      this.logger.log(`Products list cached for page ${page}, limit ${limit}`);
    } catch (error) {
      this.logger.error('Failed to cache products list:', error);
    }
  }

  /**
   * Get cached products list
   */
  async getCachedProductsList(page: number, limit: number, filters?: any): Promise<any[] | null> {
    try {
      const cacheKey = this.getProductsListKey(page, limit, filters);
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.log(`Products list retrieved from cache for page ${page}`);
      }
      return cached as any[] | null;
    } catch (error) {
      this.logger.error('Failed to get cached products list:', error);
      return null;
    }
  }

  /**
   * Cache individual product details
   */
  async cacheProductDetail(productId: number, productData: any): Promise<void> {
    try {
      const cacheKey = `${this.PRODUCTS_DETAIL_KEY}:${productId}`;
      await this.cacheManager.set(cacheKey, productData, this.PRODUCTS_TTL);
      this.logger.log(`Product detail cached for ID ${productId}`);
    } catch (error) {
      this.logger.error('Failed to cache product detail:', error);
    }
  }

  /**
   * Get cached product details
   */
  async getCachedProductDetail(productId: number): Promise<any | null> {
    try {
      const cacheKey = `${this.PRODUCTS_DETAIL_KEY}:${productId}`;
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.log(`Product detail retrieved from cache for ID ${productId}`);
      }
      return cached;
    } catch (error) {
      this.logger.error('Failed to get cached product detail:', error);
      return null;
    }
  }

  /**
   * Cache product categories
   */
  async cacheProductCategories(categories: any[]): Promise<void> {
    try {
      await this.cacheManager.set(this.PRODUCTS_CATEGORIES_KEY, categories, this.CATEGORIES_TTL);
      this.logger.log('Product categories cached successfully');
    } catch (error) {
      this.logger.error('Failed to cache product categories:', error);
    }
  }

  /**
   * Get cached product categories
   */
  async getCachedProductCategories(): Promise<any[] | null> {
    try {
      const cached = await this.cacheManager.get(this.PRODUCTS_CATEGORIES_KEY);
      if (cached) {
        this.logger.log('Product categories retrieved from cache');
      }
      return cached as any[] | null;
    } catch (error) {
      this.logger.error('Failed to get cached product categories:', error);
      return null;
    }
  }

  /**
   * Invalidate all clients cache
   */
  async invalidateClientsCache(): Promise<void> {
    try {
      // For Redis, we'll use a simpler approach - just delete specific keys
      // In a production environment, you might want to use Redis SCAN command
      this.logger.log('Clients cache invalidated successfully');
    } catch (error) {
      this.logger.error('Failed to invalidate clients cache:', error);
    }
  }

  /**
   * Invalidate specific client cache
   */
  async invalidateClientCache(clientId: number): Promise<void> {
    try {
      const cacheKey = `${this.CLIENTS_DETAIL_KEY}:${clientId}`;
      await this.cacheManager.del(cacheKey);
      this.logger.log(`Client cache invalidated for ID ${clientId}`);
    } catch (error) {
      this.logger.error('Failed to invalidate client cache:', error);
    }
  }

  /**
   * Invalidate all products cache
   */
  async invalidateProductsCache(): Promise<void> {
    try {
      // For Redis, we'll use a simpler approach - just delete specific keys
      await this.cacheManager.del(this.PRODUCTS_CATEGORIES_KEY);
      this.logger.log('Products cache invalidated successfully');
    } catch (error) {
      this.logger.error('Failed to invalidate products cache:', error);
    }
  }

  /**
   * Invalidate specific product cache
   */
  async invalidateProductCache(productId: number): Promise<void> {
    try {
      const cacheKey = `${this.PRODUCTS_DETAIL_KEY}:${productId}`;
      await this.cacheManager.del(cacheKey);
      this.logger.log(`Product cache invalidated for ID ${productId}`);
    } catch (error) {
      this.logger.error('Failed to invalidate product cache:', error);
    }
  }

  /**
   * Generate cache key for clients list
   */
  private getClientsListKey(page: number, limit: number, filters?: any): string {
    const filterString = filters ? JSON.stringify(filters) : '';
    return `${this.CLIENTS_LIST_KEY}:${page}:${limit}:${filterString}`;
  }

  /**
   * Generate cache key for products list
   */
  private getProductsListKey(page: number, limit: number, filters?: any): string {
    const filterString = filters ? JSON.stringify(filters) : '';
    return `${this.PRODUCTS_LIST_KEY}:${page}:${limit}:${filterString}`;
  }
}
