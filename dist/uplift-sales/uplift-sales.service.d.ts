import { Repository } from 'typeorm';
import { UpliftSale } from '../entities/uplift-sale.entity';
import { UpliftSaleItem } from '../entities/uplift-sale-item.entity';
import { CreateUpliftSaleDto } from './dto/create-uplift-sale.dto';
import { UpdateUpliftSaleDto } from './dto/update-uplift-sale.dto';
export declare class UpliftSalesService {
    private upliftSaleRepository;
    private upliftSaleItemRepository;
    constructor(upliftSaleRepository: Repository<UpliftSale>, upliftSaleItemRepository: Repository<UpliftSaleItem>);
    findAll(query: any): Promise<UpliftSale[]>;
    findOne(id: number): Promise<UpliftSale>;
    create(createUpliftSaleDto: CreateUpliftSaleDto, userId: number): Promise<UpliftSale>;
    update(id: number, updateUpliftSaleDto: UpdateUpliftSaleDto): Promise<UpliftSale>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
