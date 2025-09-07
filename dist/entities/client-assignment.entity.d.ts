import { Clients } from './clients.entity';
import { SalesRep } from './sales-rep.entity';
export declare class ClientAssignment {
    id: number;
    outletId: number;
    salesRepId: number;
    assignedAt: Date;
    status: string;
    client: Clients;
    salesRep: SalesRep;
}
