import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { Store } from '../entities/store.entity';
import { StoreInventory } from '../entities/store-inventory.entity';
export declare class ProductsService {
    private productRepository;
    private storeRepository;
    private storeInventoryRepository;
    private dataSource;
    constructor(productRepository: Repository<Product>, storeRepository: Repository<Store>, storeInventoryRepository: Repository<StoreInventory>, dataSource: DataSource);
    findAll(): Promise<Product[]>;
    findProductsByCountry(userCountryId: number): Promise<Product[]>;
    private isProductAvailableInCountry;
    findOne(id: number): Promise<Product>;
    getCategoriesByCountry(countryId: number): Promise<any[]>;
    private calculateStockStatus;
    private getCountrySpecificPrice;
}
