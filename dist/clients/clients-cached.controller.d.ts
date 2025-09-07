import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { SearchClientsDto } from './dto/search-clients.dto';
import { DataCacheService } from '../cache/data-cache.service';
import { DatabaseResilienceService } from '../config/database-resilience.service';
export declare class ClientsCachedController {
    private readonly clientsService;
    private readonly dataCacheService;
    private readonly databaseResilienceService;
    private readonly logger;
    constructor(clientsService: ClientsService, dataCacheService: DataCacheService, databaseResilienceService: DatabaseResilienceService);
    create(createClientDto: CreateClientDto, req: any): Promise<{
        success: boolean;
        data: import("../entities").Clients;
        message: string;
        timestamp: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: any;
        timestamp: string;
        data?: undefined;
    }>;
    findAll(req: any, page?: string, limit?: string, search?: string, region?: string, route?: string): Promise<{
        success: boolean;
        data: any[];
        fromCache: boolean;
        pagination: {
            page: number;
            limit: number;
        };
        timestamp: string;
        error?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        error: string;
        message: any;
        timestamp: string;
        data?: undefined;
        fromCache?: undefined;
        pagination?: undefined;
    }>;
    findAllBasic(req: any, page?: string, limit?: string): Promise<{
        success: boolean;
        data: any[];
        fromCache: boolean;
        pagination: {
            page: number;
            limit: number;
        };
        timestamp: string;
        error?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        error: string;
        message: any;
        timestamp: string;
        data?: undefined;
        fromCache?: undefined;
        pagination?: undefined;
    }>;
    search(searchDto: SearchClientsDto, req: any, page?: string, limit?: string): Promise<{
        success: boolean;
        data: any[];
        fromCache: boolean;
        search: SearchClientsDto;
        pagination: {
            page: number;
            limit: number;
        };
        timestamp: string;
        error?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        error: string;
        message: any;
        timestamp: string;
        data?: undefined;
        fromCache?: undefined;
        search?: undefined;
        pagination?: undefined;
    }>;
    findOne(id: string, req: any): Promise<{
        success: boolean;
        data: any;
        fromCache: boolean;
        timestamp: string;
        error?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        error: string;
        message: any;
        timestamp: string;
        data?: undefined;
        fromCache?: undefined;
    }>;
    update(id: string, updateClientDto: Partial<CreateClientDto>, req: any): Promise<{
        success: boolean;
        data: import("../entities").Clients;
        message: string;
        timestamp: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: any;
        timestamp: string;
        data?: undefined;
    }>;
    findByCountry(countryId: string, req: any, page?: string, limit?: string): Promise<{
        success: boolean;
        data: any[];
        fromCache: boolean;
        pagination: {
            page: number;
            limit: number;
        };
        timestamp: string;
        error?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        error: string;
        message: any;
        timestamp: string;
        data?: undefined;
        fromCache?: undefined;
        pagination?: undefined;
    }>;
    invalidateClientsCache(): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message: any;
        timestamp: string;
    }>;
}
