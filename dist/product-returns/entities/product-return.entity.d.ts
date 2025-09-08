import { SalesRep } from '../../entities/sales-rep.entity';
import { Product } from '../../products/entities/product.entity';
import { Clients } from '../../entities/clients.entity';
export declare class ProductReturn {
    id: number;
    salesrepId: number;
    salesrep: SalesRep;
    productId: number;
    product: Product;
    qty: number;
    clientId: number;
    client: Clients;
    date: Date;
    status: string;
    imageUrl: string;
    reason: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
