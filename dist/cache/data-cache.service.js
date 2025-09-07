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
var DataCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataCacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
let DataCacheService = DataCacheService_1 = class DataCacheService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(DataCacheService_1.name);
        this.CLIENTS_LIST_KEY = 'clients:list';
        this.CLIENTS_DETAIL_KEY = 'clients:detail';
        this.PRODUCTS_LIST_KEY = 'products:list';
        this.PRODUCTS_DETAIL_KEY = 'products:detail';
        this.PRODUCTS_CATEGORIES_KEY = 'products:categories';
        this.CLIENTS_TTL = 600;
        this.PRODUCTS_TTL = 900;
        this.CATEGORIES_TTL = 1800;
    }
    async cacheClientsList(page, limit, clients, filters) {
        try {
            const cacheKey = this.getClientsListKey(page, limit, filters);
            await this.cacheManager.set(cacheKey, clients, this.CLIENTS_TTL);
            this.logger.log(`Clients list cached for page ${page}, limit ${limit}`);
        }
        catch (error) {
            this.logger.error('Failed to cache clients list:', error);
        }
    }
    async getCachedClientsList(page, limit, filters) {
        try {
            const cacheKey = this.getClientsListKey(page, limit, filters);
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                this.logger.log(`Clients list retrieved from cache for page ${page}`);
            }
            return cached;
        }
        catch (error) {
            this.logger.error('Failed to get cached clients list:', error);
            return null;
        }
    }
    async cacheClientDetail(clientId, clientData) {
        try {
            const cacheKey = `${this.CLIENTS_DETAIL_KEY}:${clientId}`;
            await this.cacheManager.set(cacheKey, clientData, this.CLIENTS_TTL);
            this.logger.log(`Client detail cached for ID ${clientId}`);
        }
        catch (error) {
            this.logger.error('Failed to cache client detail:', error);
        }
    }
    async getCachedClientDetail(clientId) {
        try {
            const cacheKey = `${this.CLIENTS_DETAIL_KEY}:${clientId}`;
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                this.logger.log(`Client detail retrieved from cache for ID ${clientId}`);
            }
            return cached;
        }
        catch (error) {
            this.logger.error('Failed to get cached client detail:', error);
            return null;
        }
    }
    async cacheProductsList(page, limit, products, filters) {
        try {
            const cacheKey = this.getProductsListKey(page, limit, filters);
            await this.cacheManager.set(cacheKey, products, this.PRODUCTS_TTL);
            this.logger.log(`Products list cached for page ${page}, limit ${limit}`);
        }
        catch (error) {
            this.logger.error('Failed to cache products list:', error);
        }
    }
    async getCachedProductsList(page, limit, filters) {
        try {
            const cacheKey = this.getProductsListKey(page, limit, filters);
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                this.logger.log(`Products list retrieved from cache for page ${page}`);
            }
            return cached;
        }
        catch (error) {
            this.logger.error('Failed to get cached products list:', error);
            return null;
        }
    }
    async cacheProductDetail(productId, productData) {
        try {
            const cacheKey = `${this.PRODUCTS_DETAIL_KEY}:${productId}`;
            await this.cacheManager.set(cacheKey, productData, this.PRODUCTS_TTL);
            this.logger.log(`Product detail cached for ID ${productId}`);
        }
        catch (error) {
            this.logger.error('Failed to cache product detail:', error);
        }
    }
    async getCachedProductDetail(productId) {
        try {
            const cacheKey = `${this.PRODUCTS_DETAIL_KEY}:${productId}`;
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                this.logger.log(`Product detail retrieved from cache for ID ${productId}`);
            }
            return cached;
        }
        catch (error) {
            this.logger.error('Failed to get cached product detail:', error);
            return null;
        }
    }
    async cacheProductCategories(categories) {
        try {
            await this.cacheManager.set(this.PRODUCTS_CATEGORIES_KEY, categories, this.CATEGORIES_TTL);
            this.logger.log('Product categories cached successfully');
        }
        catch (error) {
            this.logger.error('Failed to cache product categories:', error);
        }
    }
    async getCachedProductCategories() {
        try {
            const cached = await this.cacheManager.get(this.PRODUCTS_CATEGORIES_KEY);
            if (cached) {
                this.logger.log('Product categories retrieved from cache');
            }
            return cached;
        }
        catch (error) {
            this.logger.error('Failed to get cached product categories:', error);
            return null;
        }
    }
    async invalidateClientsCache() {
        try {
            this.logger.log('Clients cache invalidated successfully');
        }
        catch (error) {
            this.logger.error('Failed to invalidate clients cache:', error);
        }
    }
    async invalidateClientCache(clientId) {
        try {
            const cacheKey = `${this.CLIENTS_DETAIL_KEY}:${clientId}`;
            await this.cacheManager.del(cacheKey);
            this.logger.log(`Client cache invalidated for ID ${clientId}`);
        }
        catch (error) {
            this.logger.error('Failed to invalidate client cache:', error);
        }
    }
    async invalidateProductsCache() {
        try {
            await this.cacheManager.del(this.PRODUCTS_CATEGORIES_KEY);
            this.logger.log('Products cache invalidated successfully');
        }
        catch (error) {
            this.logger.error('Failed to invalidate products cache:', error);
        }
    }
    async invalidateProductCache(productId) {
        try {
            const cacheKey = `${this.PRODUCTS_DETAIL_KEY}:${productId}`;
            await this.cacheManager.del(cacheKey);
            this.logger.log(`Product cache invalidated for ID ${productId}`);
        }
        catch (error) {
            this.logger.error('Failed to invalidate product cache:', error);
        }
    }
    getClientsListKey(page, limit, filters) {
        const filterString = filters ? JSON.stringify(filters) : '';
        return `${this.CLIENTS_LIST_KEY}:${page}:${limit}:${filterString}`;
    }
    getProductsListKey(page, limit, filters) {
        const filterString = filters ? JSON.stringify(filters) : '';
        return `${this.PRODUCTS_LIST_KEY}:${page}:${limit}:${filterString}`;
    }
};
exports.DataCacheService = DataCacheService;
exports.DataCacheService = DataCacheService = DataCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], DataCacheService);
//# sourceMappingURL=data-cache.service.js.map