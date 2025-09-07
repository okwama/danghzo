"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ClientsCachedController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsCachedController = void 0;
const common_1 = require("@nestjs/common");
const clients_service_1 = require("./clients.service");
const create_client_dto_1 = require("./dto/create-client.dto");
const search_clients_dto_1 = require("./dto/search-clients.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const data_cache_service_1 = require("../cache/data-cache.service");
const database_resilience_service_1 = require("../config/database-resilience.service");
let ClientsCachedController = ClientsCachedController_1 = class ClientsCachedController {
    constructor(clientsService, dataCacheService, databaseResilienceService) {
        this.clientsService = clientsService;
        this.dataCacheService = dataCacheService;
        this.databaseResilienceService = databaseResilienceService;
        this.logger = new common_1.Logger(ClientsCachedController_1.name);
    }
    async create(createClientDto, req) {
        try {
            const userCountryId = req.user.countryId;
            const isConnected = await this.databaseResilienceService.testConnection();
            if (!isConnected) {
                throw new common_1.HttpException('Database connection unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            const result = await this.clientsService.create(createClientDto, userCountryId);
            await this.dataCacheService.invalidateClientsCache();
            return {
                success: true,
                data: result,
                message: 'Client created successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error creating client:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            return {
                success: false,
                error: 'Failed to create client',
                message: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async findAll(req, page = '1', limit = '20', search, region, route) {
        try {
            const userCountryId = req.user.countryId;
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const filters = { search, region, route, countryId: userCountryId };
            const cachedClients = await this.dataCacheService.getCachedClientsList(pageNum, limitNum, filters);
            if (cachedClients) {
                this.logger.log(`Clients list served from cache for page ${pageNum}`);
                return {
                    success: true,
                    data: cachedClients,
                    fromCache: true,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                    },
                    timestamp: new Date().toISOString(),
                };
            }
            const isConnected = await this.databaseResilienceService.testConnection();
            if (!isConnected) {
                throw new common_1.HttpException('Database connection unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            this.logger.log(`Fetching clients from database for page ${pageNum}`);
            const clients = await this.clientsService.findAll(userCountryId);
            await this.dataCacheService.cacheClientsList(pageNum, limitNum, clients, filters);
            return {
                success: true,
                data: clients,
                fromCache: false,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error fetching clients:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            return {
                success: false,
                error: 'Failed to fetch clients',
                message: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async findAllBasic(req, page = '1', limit = '20') {
        try {
            const userCountryId = req.user.countryId;
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const filters = { basic: true, countryId: userCountryId };
            const cachedClients = await this.dataCacheService.getCachedClientsList(pageNum, limitNum, filters);
            if (cachedClients) {
                this.logger.log(`Basic clients list served from cache for page ${pageNum}`);
                return {
                    success: true,
                    data: cachedClients,
                    fromCache: true,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                    },
                    timestamp: new Date().toISOString(),
                };
            }
            const isConnected = await this.databaseResilienceService.testConnection();
            if (!isConnected) {
                throw new common_1.HttpException('Database connection unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            this.logger.log(`Fetching basic clients from database for page ${pageNum}`);
            const clients = await this.clientsService.findAll(userCountryId);
            await this.dataCacheService.cacheClientsList(pageNum, limitNum, clients, filters);
            return {
                success: true,
                data: clients,
                fromCache: false,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error fetching basic clients:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            return {
                success: false,
                error: 'Failed to fetch basic clients',
                message: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async search(searchDto, req, page = '1', limit = '20') {
        try {
            const userCountryId = req.user.countryId;
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const filters = { ...searchDto, countryId: userCountryId };
            const cachedClients = await this.dataCacheService.getCachedClientsList(pageNum, limitNum, filters);
            if (cachedClients) {
                this.logger.log(`Search results served from cache for page ${pageNum}`);
                return {
                    success: true,
                    data: cachedClients,
                    fromCache: true,
                    search: searchDto,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                    },
                    timestamp: new Date().toISOString(),
                };
            }
            const isConnected = await this.databaseResilienceService.testConnection();
            if (!isConnected) {
                throw new common_1.HttpException('Database connection unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            this.logger.log(`Searching clients in database for page ${pageNum}`);
            const clients = await this.clientsService.search(searchDto, userCountryId);
            await this.dataCacheService.cacheClientsList(pageNum, limitNum, clients, filters);
            return {
                success: true,
                data: clients,
                fromCache: false,
                search: searchDto,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error searching clients:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            return {
                success: false,
                error: 'Failed to search clients',
                message: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async findOne(id, req) {
        try {
            const userCountryId = req.user.countryId;
            const clientId = parseInt(id, 10);
            const cachedClient = await this.dataCacheService.getCachedClientDetail(clientId);
            if (cachedClient) {
                this.logger.log(`Client detail served from cache for ID ${clientId}`);
                return {
                    success: true,
                    data: cachedClient,
                    fromCache: true,
                    timestamp: new Date().toISOString(),
                };
            }
            const isConnected = await this.databaseResilienceService.testConnection();
            if (!isConnected) {
                throw new common_1.HttpException('Database connection unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            this.logger.log(`Fetching client from database for ID ${clientId}`);
            const client = await this.clientsService.findOne(clientId, userCountryId);
            await this.dataCacheService.cacheClientDetail(clientId, client);
            return {
                success: true,
                data: client,
                fromCache: false,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error fetching client:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            return {
                success: false,
                error: 'Failed to fetch client',
                message: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async update(id, updateClientDto, req) {
        try {
            const userCountryId = req.user.countryId;
            const clientId = parseInt(id, 10);
            const isConnected = await this.databaseResilienceService.testConnection();
            if (!isConnected) {
                throw new common_1.HttpException('Database connection unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            const result = await this.clientsService.update(clientId, updateClientDto, userCountryId);
            await Promise.all([
                this.dataCacheService.invalidateClientCache(clientId),
                this.dataCacheService.invalidateClientsCache(),
            ]);
            return {
                success: true,
                data: result,
                message: 'Client updated successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error updating client:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            return {
                success: false,
                error: 'Failed to update client',
                message: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async findByCountry(countryId, req, page = '1', limit = '20') {
        try {
            const userCountryId = req.user.countryId;
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const filters = { countryId: parseInt(countryId, 10), userCountryId };
            const cachedClients = await this.dataCacheService.getCachedClientsList(pageNum, limitNum, filters);
            if (cachedClients) {
                this.logger.log(`Country clients served from cache for page ${pageNum}`);
                return {
                    success: true,
                    data: cachedClients,
                    fromCache: true,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                    },
                    timestamp: new Date().toISOString(),
                };
            }
            const isConnected = await this.databaseResilienceService.testConnection();
            if (!isConnected) {
                throw new common_1.HttpException('Database connection unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            this.logger.log(`Fetching country clients from database for page ${pageNum}`);
            const clients = await this.clientsService.findByCountry(+countryId, userCountryId);
            await this.dataCacheService.cacheClientsList(pageNum, limitNum, clients, filters);
            return {
                success: true,
                data: clients,
                fromCache: false,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error fetching country clients:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            return {
                success: false,
                error: 'Failed to fetch country clients',
                message: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async invalidateClientsCache() {
        try {
            await this.dataCacheService.invalidateClientsCache();
            this.logger.log('Clients cache invalidated successfully');
            return {
                success: true,
                message: 'Clients cache invalidated successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error invalidating clients cache:', error);
            return {
                success: false,
                error: 'Failed to invalidate clients cache',
                message: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.ClientsCachedController = ClientsCachedController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.CreateClientDto, Object]),
    __metadata("design:returntype", Promise)
], ClientsCachedController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('region')),
    __param(5, (0, common_1.Query)('route')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ClientsCachedController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('basic'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ClientsCachedController.prototype, "findAllBasic", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_clients_dto_1.SearchClientsDto, Object, String, String]),
    __metadata("design:returntype", Promise)
], ClientsCachedController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClientsCachedController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ClientsCachedController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('country/:countryId'),
    __param(0, (0, common_1.Param)('countryId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], ClientsCachedController.prototype, "findByCountry", null);
__decorate([
    (0, common_1.Get)('cache/invalidate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClientsCachedController.prototype, "invalidateClientsCache", null);
exports.ClientsCachedController = ClientsCachedController = ClientsCachedController_1 = __decorate([
    (0, common_1.Controller)('clients'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [clients_service_1.ClientsService,
        data_cache_service_1.DataCacheService,
        database_resilience_service_1.DatabaseResilienceService])
], ClientsCachedController);
//# sourceMappingURL=clients-cached.controller.js.map