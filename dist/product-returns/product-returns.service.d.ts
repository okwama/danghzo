import { Repository } from 'typeorm';
import { ProductReturn } from './entities/product-return.entity';
import { CreateProductReturnDto } from './dto/create-product-return.dto';
import { UpdateProductReturnDto } from './dto/update-product-return.dto';
import { UpdateReturnStatusDto } from './dto/return-status.dto';
export declare class ProductReturnsService {
    private productReturnRepository;
    constructor(productReturnRepository: Repository<ProductReturn>);
    create(createProductReturnDto: CreateProductReturnDto): Promise<ProductReturn>;
    findAll(): Promise<ProductReturn[]>;
    findOne(id: number): Promise<ProductReturn>;
    findBySalesRep(salesrepId: number): Promise<ProductReturn[]>;
    findByClient(clientId: number): Promise<ProductReturn[]>;
    findByStatus(status: string): Promise<ProductReturn[]>;
    findByDateRange(startDate: string, endDate: string): Promise<ProductReturn[]>;
    update(id: number, updateProductReturnDto: UpdateProductReturnDto): Promise<ProductReturn>;
    updateStatus(id: number, updateStatusDto: UpdateReturnStatusDto): Promise<ProductReturn>;
    remove(id: number): Promise<void>;
    getReturnStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        processed: number;
    }>;
    getReturnsByProduct(productId: number): Promise<ProductReturn[]>;
}
