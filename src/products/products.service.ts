import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { Store } from '../entities/store.entity';
import { StoreInventory } from '../entities/store-inventory.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(StoreInventory)
    private storeInventoryRepository: Repository<StoreInventory>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<Product[]> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 Fetching all active products with inventory and price options... (attempt ${attempt}/${maxRetries})`);
        
        // Get products with their store inventory data and category price options
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
      } catch (error) {
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

  async findProductsByCountry(userCountryId: number): Promise<Product[]> {
    try {
      console.log(`🌍 Fetching products for country: ${userCountryId}`);
      
      // Get all active products with inventory data and category price options
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

      // Return all products for the country, regardless of stock availability
      // The client can handle stock filtering if needed
      const countryProducts = [];
      
      for (const product of allProducts) {
        // Filter store inventory to only include stores in user's country
        if (product.storeInventory) {
          product.storeInventory = product.storeInventory.filter(inventory => {
            return inventory.store && 
                   inventory.store.countryId === userCountryId && 
                   inventory.store.isActive === true;
          });
        }
        
        // Calculate stock status for the country
        const stockInfo = this.calculateStockStatus(product, userCountryId);
        
        // Add stock information to product
        (product as any).stockStatus = stockInfo.status;
        (product as any).totalStock = stockInfo.totalStock;
        (product as any).isOutOfStock = stockInfo.isOutOfStock;
        (product as any).isLowStock = stockInfo.isLowStock;
        (product as any).allowOutOfStockOrder = true; // Allow orders even when out of stock
        
        // Apply country-specific pricing
        product.sellingPrice = this.getCountrySpecificPrice(product, userCountryId);
        
        countryProducts.push(product);
      }

      console.log(`✅ Returning ${countryProducts.length} products for country ${userCountryId}`);
      return countryProducts;

    } catch (error) {
      console.error('❌ Error in findProductsByCountry:', error);
      
      // Fallback: Return all products if country filtering fails
      console.log('🔄 Falling back to all products due to error');
      return this.findAll();
    }
  }

  private async isProductAvailableInCountry(productId: number, countryId: number): Promise<boolean> {
    try {
      // Check if any store in the country has this product with stock
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

      return !!result; // Returns true if product is available in country

    } catch (error) {
      console.error(`❌ Error checking product ${productId} availability in country ${countryId}:`, error);
      
      // Fallback: Check if product exists in store 1 (default store)
      try {
        const fallbackResult = await this.dataSource
          .createQueryBuilder()
          .select('si.quantity')
          .from('store_inventory', 'si')
          .where('si.product_id = :productId', { productId })
          .andWhere('si.store_id = 1') // Default to store 1
          .andWhere('si.quantity > 0')
          .getRawOne();

        console.log(`🔄 Product ${productId} fallback to store 1: ${!!fallbackResult}`);
        return !!fallbackResult;

      } catch (fallbackError) {
        console.error(`❌ Fallback check failed for product ${productId}:`, fallbackError);
        return false; // If even fallback fails, exclude the product
      }
    }
  }

  async findOne(id: number): Promise<Product> {
    return this.productRepository.findOne({ where: { id } });
  }

  /**
   * Calculate stock status for a product in a specific country
   * @param product The product entity
   * @param countryId The user's country ID
   * @returns Stock status information
   */
  private calculateStockStatus(product: Product, countryId: number): {
    status: string;
    totalStock: number;
    isOutOfStock: boolean;
    isLowStock: boolean;
  } {
    let totalStock = 0;
    
    // Calculate total stock from all stores in the country
    if (product.storeInventory && product.storeInventory.length > 0) {
      totalStock = product.storeInventory.reduce((sum, inventory) => {
        return sum + (inventory.quantity || 0);
      }, 0);
    }
    
    // Determine stock status
    const isOutOfStock = totalStock <= 0;
    const isLowStock = totalStock > 0 && totalStock <= (product.reorderLevel || 10);
    
    let status = 'In Stock';
    if (isOutOfStock) {
      status = 'Out of Stock';
    } else if (isLowStock) {
      status = 'Low Stock';
    }
    
    return {
      status,
      totalStock,
      isOutOfStock,
      isLowStock
    };
  }

  /**
   * Get country-specific price for a product
   * @param product The product entity
   * @param countryId The user's country ID (1=Kenya, 2=Tanzania, 3=Nigeria)
   * @returns The appropriate price for the country
   */
  private getCountrySpecificPrice(product: Product, countryId: number): number {
    try {
      // If product has category price options, use them
      if (product.categoryEntity?.categoryPriceOptions?.length > 0) {
        const priceOption = product.categoryEntity.categoryPriceOptions[0]; // Use first option
        
        switch (countryId) {
          case 1: // Kenya
            return priceOption.value || 0;
          case 2: // Tanzania
            return priceOption.valueTzs || 0;
          case 3: // Nigeria
            return priceOption.valueNgn || 0;
          default:
            return priceOption.value || 0; // Default to Kenya price
        }
      }
      
      // Fallback to product's selling price if no category price options
      return product.sellingPrice || 0;
      
    } catch (error) {
      console.error(`❌ Error getting country-specific price for product ${product.id}:`, error);
      return product.sellingPrice || 0; // Fallback to original selling price
    }
  }
} 