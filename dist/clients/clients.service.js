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
var ClientsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const clients_entity_1 = require("../entities/clients.entity");
const client_assignment_entity_1 = require("../entities/client-assignment.entity");
const database_resilience_service_1 = require("../config/database-resilience.service");
let ClientsService = ClientsService_1 = class ClientsService {
    constructor(clientRepository, clientAssignmentRepository, databaseResilienceService) {
        this.clientRepository = clientRepository;
        this.clientAssignmentRepository = clientAssignmentRepository;
        this.databaseResilienceService = databaseResilienceService;
        this.logger = new common_1.Logger(ClientsService_1.name);
    }
    async create(createClientDto, userCountryId) {
        return this.databaseResilienceService.executeWithRetry(async () => {
            const clientData = {
                ...createClientDto,
                countryId: userCountryId,
                status: 1,
            };
            const client = this.clientRepository.create(clientData);
            return this.clientRepository.save(client);
        }, { maxAttempts: 3, timeout: 15000 });
    }
    async findAll(userCountryId, userId) {
        return this.databaseResilienceService.executeWithRetry(async () => {
            if (userId) {
                this.logger.debug(`🔍 Checking client assignments for user ${userId}`);
                const assignments = await this.clientAssignmentRepository.find({
                    where: {
                        salesRepId: userId,
                        status: 'active'
                    },
                    relations: ['client']
                });
                if (assignments.length > 0) {
                    this.logger.debug(`✅ User ${userId} has ${assignments.length} assigned clients:`);
                    assignments.forEach(assignment => {
                        this.logger.debug(`   - ${assignment.client.name} (ID: ${assignment.client.id})`);
                    });
                    return assignments.map(assignment => assignment.client);
                }
                else {
                    this.logger.debug(`❌ No active assignment found for user ${userId}, returning all clients`);
                }
            }
            return this.clientRepository.find({
                where: {
                    status: 1,
                    countryId: userCountryId,
                },
                select: [
                    'id',
                    'name',
                    'contact',
                    'region',
                    'region_id',
                    'status',
                    'countryId'
                ],
                order: { name: 'ASC' },
            });
        }, { maxAttempts: 3, timeout: 20000 });
    }
    async findOne(id, userCountryId) {
        return this.databaseResilienceService.executeWithRetry(async () => {
            return this.clientRepository.findOne({
                where: {
                    id,
                    status: 1,
                    countryId: userCountryId,
                },
            });
        }, { maxAttempts: 3, timeout: 10000 });
    }
    async findOneBasic(id, userCountryId) {
        return this.databaseResilienceService.executeWithRetry(async () => {
            return this.clientRepository.findOne({
                where: {
                    id,
                    status: 1,
                    countryId: userCountryId,
                },
                select: [
                    'id',
                    'name',
                    'contact',
                    'region',
                    'region_id',
                    'status',
                    'countryId'
                ],
            });
        }, { maxAttempts: 3, timeout: 10000 });
    }
    async update(id, updateClientDto, userCountryId) {
        return this.databaseResilienceService.executeWithRetry(async () => {
            const existingClient = await this.findOne(id, userCountryId);
            if (!existingClient) {
                return null;
            }
            await this.clientRepository.update(id, updateClientDto);
            return this.findOne(id, userCountryId);
        }, { maxAttempts: 3, timeout: 15000 });
    }
    async search(searchDto, userCountryId) {
        return this.databaseResilienceService.executeWithRetry(async () => {
            const { query, regionId, routeId, status } = searchDto;
            const whereConditions = {
                countryId: userCountryId,
            };
            if (regionId)
                whereConditions.region_id = regionId;
            if (routeId)
                whereConditions.route_id = routeId;
            if (status !== undefined)
                whereConditions.status = status;
            const queryBuilder = this.clientRepository.createQueryBuilder('client');
            Object.keys(whereConditions).forEach(key => {
                queryBuilder.andWhere(`client.${key} = :${key}`, { [key]: whereConditions[key] });
            });
            if (query) {
                queryBuilder.andWhere('(client.name LIKE :query OR client.contact LIKE :query OR client.email LIKE :query OR client.address LIKE :query)', { query: `%${query}%` });
            }
            return queryBuilder
                .select([
                'client.id',
                'client.name',
                'client.contact',
                'client.region',
                'client.region_id',
                'client.status',
                'client.countryId'
            ])
                .orderBy('client.name', 'ASC')
                .getMany();
        }, { maxAttempts: 3, timeout: 20000 });
    }
    async findByCountry(countryId, userCountryId) {
        return this.databaseResilienceService.executeWithRetry(async () => {
            if (countryId !== userCountryId) {
                return [];
            }
            return this.clientRepository.find({
                where: { countryId, status: 1 },
                select: [
                    'id',
                    'name',
                    'contact',
                    'region',
                    'region_id',
                    'status',
                    'countryId'
                ],
                order: { name: 'ASC' },
            });
        }, { maxAttempts: 3, timeout: 20000 });
    }
    async findByRegion(regionId, userCountryId) {
        return this.databaseResilienceService.executeWithRetry(async () => {
            return this.clientRepository.find({
                where: {
                    region_id: regionId,
                    status: 1,
                    countryId: userCountryId,
                },
                select: [
                    'id',
                    'name',
                    'contact',
                    'region',
                    'region_id',
                    'status',
                    'countryId'
                ],
                order: { name: 'ASC' },
            });
        }, { maxAttempts: 3, timeout: 20000 });
    }
    async findByRoute(routeId, userCountryId) {
        return this.databaseResilienceService.executeWithRetry(async () => {
            return this.clientRepository.find({
                where: {
                    route_id: routeId,
                    status: 1,
                    countryId: userCountryId,
                },
                select: [
                    'id',
                    'name',
                    'contact',
                    'region',
                    'region_id',
                    'status',
                    'countryId'
                ],
                order: { name: 'ASC' },
            });
        }, { maxAttempts: 3, timeout: 20000 });
    }
    async findByLocation(latitude, longitude, radius = 10, userCountryId) {
        return this.databaseResilienceService.executeWithRetry(async () => {
            const query = `
        SELECT *, 
          (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
        FROM Clients 
        WHERE status = 1 AND countryId = ?
        HAVING distance <= ?
        ORDER BY distance
      `;
            return this.clientRepository.query(query, [latitude, longitude, latitude, userCountryId, radius]);
        }, { maxAttempts: 3, timeout: 25000 });
    }
    async getClientStats(userCountryId, regionId) {
        return this.databaseResilienceService.executeWithRetry(async () => {
            const queryBuilder = this.clientRepository.createQueryBuilder('client');
            queryBuilder.where('client.countryId = :countryId', { countryId: userCountryId });
            if (regionId) {
                queryBuilder.andWhere('client.region_id = :regionId', { regionId });
            }
            const total = await queryBuilder.getCount();
            const active = await queryBuilder.where('client.status = 1').getCount();
            const inactive = await queryBuilder.where('client.status = 0').getCount();
            return {
                total,
                active,
                inactive,
                activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
            };
        }, { maxAttempts: 3, timeout: 15000 });
    }
    async findPendingClients(userCountryId) {
        return this.databaseResilienceService.executeWithRetry(async () => {
            return this.clientRepository.find({
                where: {
                    status: 0,
                    countryId: userCountryId,
                },
                select: [
                    'id',
                    'name',
                    'contact',
                    'region',
                    'region_id',
                    'status',
                    'countryId',
                    'email',
                    'address',
                    'created_at',
                    'added_by'
                ],
                order: { created_at: 'DESC' },
            });
        }, { maxAttempts: 3, timeout: 20000 });
    }
    async approveClient(id, userCountryId) {
        return this.databaseResilienceService.executeWithRetry(async () => {
            const existingClient = await this.clientRepository.findOne({
                where: {
                    id,
                    status: 0,
                    countryId: userCountryId,
                },
            });
            if (!existingClient) {
                return null;
            }
            await this.clientRepository.update(id, { status: 1 });
            return this.findOne(id, userCountryId);
        }, { maxAttempts: 3, timeout: 15000 });
    }
    async rejectClient(id, userCountryId) {
        return this.databaseResilienceService.executeWithRetry(async () => {
            const existingClient = await this.clientRepository.findOne({
                where: {
                    id,
                    status: 0,
                    countryId: userCountryId,
                },
            });
            if (!existingClient) {
                return false;
            }
            await this.clientRepository.update(id, { status: 2 });
            return true;
        }, { maxAttempts: 3, timeout: 15000 });
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = ClientsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(clients_entity_1.Clients)),
    __param(1, (0, typeorm_1.InjectRepository)(client_assignment_entity_1.ClientAssignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        database_resilience_service_1.DatabaseResilienceService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map