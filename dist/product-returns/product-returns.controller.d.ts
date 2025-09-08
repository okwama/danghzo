import { ProductReturnsService } from './product-returns.service';
import { CreateProductReturnDto } from './dto/create-product-return.dto';
import { UpdateProductReturnDto } from './dto/update-product-return.dto';
import { UpdateReturnStatusDto } from './dto/return-status.dto';
export declare class ProductReturnsController {
    private readonly productReturnsService;
    constructor(productReturnsService: ProductReturnsService);
    create(createProductReturnDto: CreateProductReturnDto): Promise<import("./entities/product-return.entity").ProductReturn>;
    findAll(): Promise<import("./entities/product-return.entity").ProductReturn[]>;
    getStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        processed: number;
    }>;
    findBySalesRep(salesrepId: number): Promise<import("./entities/product-return.entity").ProductReturn[]>;
    findByClient(clientId: number): Promise<import("./entities/product-return.entity").ProductReturn[]>;
    findByProduct(productId: number): Promise<import("./entities/product-return.entity").ProductReturn[]>;
    findByStatus(status: string): Promise<import("./entities/product-return.entity").ProductReturn[]>;
    findByDateRange(startDate: string, endDate: string): Promise<import("./entities/product-return.entity").ProductReturn[]>;
    findOne(id: number): Promise<import("./entities/product-return.entity").ProductReturn>;
    update(id: number, updateProductReturnDto: UpdateProductReturnDto): Promise<import("./entities/product-return.entity").ProductReturn>;
    updateStatus(id: number, updateStatusDto: UpdateReturnStatusDto): Promise<import("./entities/product-return.entity").ProductReturn>;
    remove(id: number): Promise<void>;
}
