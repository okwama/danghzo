import { SalesRep } from './sales-rep.entity';
import { Clients } from './clients.entity';
export declare class CompetitorReport {
    id: number;
    reportId: number;
    competitorName: string;
    productName: string;
    price: number;
    quantity: number;
    promotion: string;
    comment: string;
    imageUrl: string;
    createdAt: Date;
    clientId: number;
    userId: number;
    user: SalesRep;
    client: Clients;
}
