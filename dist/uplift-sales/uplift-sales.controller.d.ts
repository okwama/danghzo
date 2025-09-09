import { UpliftSalesService } from './uplift-sales.service';
import { CreateUpliftSaleDto } from './dto/create-uplift-sale.dto';
import { UpdateUpliftSaleDto } from './dto/update-uplift-sale.dto';
export declare class UpliftSalesController {
    private readonly upliftSalesService;
    constructor(upliftSalesService: UpliftSalesService);
    findAll(query: any): Promise<import("../entities").UpliftSale[]>;
    findOne(id: string): Promise<import("../entities").UpliftSale>;
    create(createUpliftSaleDto: CreateUpliftSaleDto, req: any): Promise<import("../entities").UpliftSale>;
    update(id: string, updateUpliftSaleDto: UpdateUpliftSaleDto): Promise<import("../entities").UpliftSale>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
