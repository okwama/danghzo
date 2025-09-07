import { ProductsService } from './products.service';
import { DataSource } from 'typeorm';
export declare class ProductsController {
    private readonly productsService;
    private dataSource;
    constructor(productsService: ProductsService, dataSource: DataSource);
    findAll(): Promise<import("./entities/product.entity").Product[]>;
    findProductsByCountry(req: any): Promise<import("./entities/product.entity").Product[]>;
    findOne(id: string): Promise<import("./entities/product.entity").Product>;
}
export declare class HealthController {
    private dataSource;
    constructor(dataSource: DataSource);
    productsHealthCheck(): Promise<{
        status: string;
        database: string;
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        database: string;
        error: any;
        timestamp: string;
    }>;
}
