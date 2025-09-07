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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const store_entity_1 = require("../entities/store.entity");
const store_inventory_entity_1 = require("../entities/store-inventory.entity");
let ProductsService = class ProductsService {
    constructor(productRepository, storeRepository, storeInventoryRepository, dataSource) {
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
        this.storeInventoryRepository = storeInventoryRepository;
        this.dataSource = dataSource;
    }
    async findAll() {
        const maxRetries = 3;
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔍 Fetching all active products with inventory and price options... (attempt ${attempt}/${maxRetries})`);
                const products = await this.productRepository
                    .createQueryBuilder('product')
                    .leftJoinAndSelect('product.storeInventory', 'storeInventory')
                    .leftJoinAndSelect('storeInventory.store', 'store')
                    .leftJoinAndSelect('product.categoryEntity', 'category')
                    .leftJoinAndSelect('category.categoryPriceOptions', 'categoryPriceOptions')
                    .where('product.isActive = :isActive', { isActive: true })
                    .orderBy('product.productName', 'ASC')
                    .getMany();
                console.log(`✅ Found ${products.length} active products with inventory and price options data`);
                return products;
            }
            catch (error) {
                lastError = error;
                console.error(`❌ Error fetching products (attempt ${attempt}/${maxRetries}):`, error);
                if (attempt < maxRetries) {
                    console.log(`⏳ Retrying in ${attempt * 1000}ms...`);
                    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                }
            }
        }
        console.error('❌ Failed to fetch products after all retries');
        throw lastError;
    }
    async findProductsByCountry(userCountryId) {
        try {
            console.log(`🌍 Fetching products for country: ${userCountryId}`);
            const allProducts = await this.productRepository
                .createQueryBuilder('product')
                .leftJoinAndSelect('product.storeInventory', 'storeInventory')
                .leftJoinAndSelect('storeInventory.store', 'store')
                .leftJoinAndSelect('product.categoryEntity', 'category')
                .leftJoinAndSelect('category.categoryPriceOptions', 'categoryPriceOptions')
                .where('product.isActive = :isActive', { isActive: true })
                .orderBy('product.productName', 'ASC')
                .getMany();
            console.log(`📦 Found ${allProducts.length} total active products with inventory and price options`);
            const countryProducts = [];
            for (const product of allProducts) {
                if (product.storeInventory) {
                    product.storeInventory = product.storeInventory.filter(inventory => {
                        return inventory.store &&
                            inventory.store.countryId === userCountryId &&
                            inventory.store.isActive === true;
                    });
                }
                const stockInfo = this.calculateStockStatus(product, userCountryId);
                product.stockStatus = stockInfo.status;
                product.totalStock = stockInfo.totalStock;
                product.isOutOfStock = stockInfo.isOutOfStock;
                product.isLowStock = stockInfo.isLowStock;
                product.allowOutOfStockOrder = true;
                product.sellingPrice = this.getCountrySpecificPrice(product, userCountryId);
                countryProducts.push(product);
            }
            console.log(`✅ Returning ${countryProducts.length} products for country ${userCountryId}`);
            return countryProducts;
        }
        catch (error) {
            console.error('❌ Error in findProductsByCountry:', error);
            console.log('🔄 Falling back to all products due to error');
            return this.findAll();
        }
    }
    async isProductAvailableInCountry(productId, countryId) {
        try {
            const result = await this.dataSource
                .createQueryBuilder()
                .select('si.quantity')
                .from('store_inventory', 'si')
                .innerJoin('stores', 's', 's.id = si.store_id')
                .where('si.product_id = :productId', { productId })
                .andWhere('s.country_id = :countryId', { countryId })
                .andWhere('s.is_active = :isActive', { isActive: true })
                .andWhere('si.quantity > 0')
                .getRawOne();
            return !!result;
        }
        catch (error) {
            console.error(`❌ Error checking product ${productId} availability in country ${countryId}:`, error);
            try {
                const fallbackResult = await this.dataSource
                    .createQueryBuilder()
                    .select('si.quantity')
                    .from('store_inventory', 'si')
                    .where('si.product_id = :productId', { productId })
                    .andWhere('si.store_id = 1')
                    .andWhere('si.quantity > 0')
                    .getRawOne();
                console.log(`🔄 Product ${productId} fallback to store 1: ${!!fallbackResult}`);
                return !!fallbackResult;
            }
            catch (fallbackError) {
                console.error(`❌ Fallback check failed for product ${productId}:`, fallbackError);
                return false;
            }
        }
    }
    async findOne(id) {
        return this.productRepository.findOne({ where: { id } });
    }
    calculateStockStatus(product, countryId) {
        let totalStock = 0;
        if (product.storeInventory && product.storeInventory.length > 0) {
            totalStock = product.storeInventory.reduce((sum, inventory) => {
                return sum + (inventory.quantity || 0);
            }, 0);
        }
        const isOutOfStock = totalStock <= 0;
        const isLowStock = totalStock > 0 && totalStock <= (product.reorderLevel || 10);
        let status = 'In Stock';
        if (isOutOfStock) {
            status = 'Out of Stock';
        }
        else if (isLowStock) {
            status = 'Low Stock';
        }
        return {
            status,
            totalStock,
            isOutOfStock,
            isLowStock
        };
    }
    getCountrySpecificPrice(product, countryId) {
        try {
            if (product.categoryEntity?.categoryPriceOptions?.length > 0) {
                const priceOption = product.categoryEntity.categoryPriceOptions[0];
                switch (countryId) {
                    case 1:
                        return priceOption.value || 0;
                    case 2:
                        return priceOption.valueTzs || 0;
                    case 3:
                        return priceOption.valueNgn || 0;
                    default:
                        return priceOption.value || 0;
                }
            }
            return product.sellingPrice || 0;
        }
        catch (error) {
            console.error(`❌ Error getting country-specific price for product ${product.id}:`, error);
            return product.sellingPrice || 0;
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(store_entity_1.Store)),
    __param(2, (0, typeorm_1.InjectRepository)(store_inventory_entity_1.StoreInventory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ProductsService);
//# sourceMappingURL=products.service.js.map