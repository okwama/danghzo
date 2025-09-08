import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { SearchClientsDto } from './dto/search-clients.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(createProspectDto: CreateProspectDto, req: any): Promise<import("../entities/clients-prospects.entity").ClientsProspects>;
    findAll(req: any): Promise<import("../entities").Clients[]>;
    findAllBasic(req: any): Promise<import("../entities").Clients[]>;
    search(searchDto: SearchClientsDto, req: any): Promise<import("../entities").Clients[]>;
    searchBasic(searchDto: SearchClientsDto, req: any): Promise<import("../entities").Clients[]>;
    findOne(id: string, req: any): Promise<import("../entities").Clients>;
    findOneBasic(id: string, req: any): Promise<import("../entities").Clients>;
    update(id: string, updateClientDto: Partial<CreateClientDto>, req: any): Promise<import("../entities").Clients>;
    findByCountry(countryId: string, req: any): Promise<import("../entities").Clients[]>;
    findByRegion(regionId: string, req: any): Promise<import("../entities").Clients[]>;
    findByRoute(routeId: string, req: any): Promise<import("../entities").Clients[]>;
    findByLocation(latitude: string, longitude: string, radius: string, req: any): Promise<import("../entities").Clients[]>;
    getClientStats(regionId: string, req: any): Promise<any>;
    addToProspects(id: string, req: any): Promise<import("../entities/clients-prospects.entity").ClientsProspects>;
    findAllProspects(req: any): Promise<import("../entities/clients-prospects.entity").ClientsProspects[]>;
}
