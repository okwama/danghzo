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
var JourneyPlansService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyPlansService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const journey_plan_entity_1 = require("./entities/journey-plan.entity");
const clients_entity_1 = require("../entities/clients.entity");
const sales_rep_entity_1 = require("../entities/sales-rep.entity");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let JourneyPlansService = JourneyPlansService_1 = class JourneyPlansService {
    constructor(journeyPlanRepository, clientsRepository, salesRepRepository, dataSource, cloudinaryService) {
        this.journeyPlanRepository = journeyPlanRepository;
        this.clientsRepository = clientsRepository;
        this.salesRepRepository = salesRepRepository;
        this.dataSource = dataSource;
        this.cloudinaryService = cloudinaryService;
        this.logger = new common_1.Logger(JourneyPlansService_1.name);
    }
    getFallbackCoordinates(countryId) {
        const countryCoordinates = {
            1: { latitude: -1.300897837533575, longitude: 36.777742335574864 },
            2: { latitude: -6.8235, longitude: 39.2695 },
            3: { latitude: 0.3476, longitude: 32.5825 },
            4: { latitude: -1.9441, longitude: 30.0619 },
            5: { latitude: -3.3731, longitude: 29.9189 },
        };
        return countryCoordinates[countryId] || countryCoordinates[1];
    }
    async ensureClientCoordinates(client) {
        if (!client)
            return client;
        console.log(`🔍 Checking coordinates for client ${client.id}:`, {
            latitude: client.latitude,
            longitude: client.longitude,
            countryId: client.countryId
        });
        if (client.latitude === null || client.longitude === null || client.latitude === undefined || client.longitude === undefined) {
            try {
                console.log(`🔍 Fetching full client data for client ${client.id}...`);
                const fullClient = await this.clientsRepository.findOne({
                    where: { id: client.id },
                    select: ['id', 'name', 'address', 'contact', 'email', 'latitude', 'longitude', 'region_id', 'region', 'countryId', 'status', 'tax_pin', 'location', 'client_type', 'outlet_account', 'balance', 'created_at']
                });
                if (fullClient) {
                    console.log(`🔍 Full client data for ${client.id}:`, {
                        latitude: fullClient.latitude,
                        longitude: fullClient.longitude,
                        countryId: fullClient.countryId
                    });
                    if (fullClient.latitude === null || fullClient.longitude === null) {
                        const fallback = this.getFallbackCoordinates(fullClient.countryId || 1);
                        console.log(`⚠️ Client ${client.id} has null coordinates in DB, using fallback:`, fallback);
                        return {
                            ...client,
                            latitude: fallback.latitude,
                            longitude: fallback.longitude,
                        };
                    }
                    else {
                        console.log(`✅ Client ${client.id} coordinates fetched from DB:`, { latitude: fullClient.latitude, longitude: fullClient.longitude });
                        return {
                            ...client,
                            latitude: fullClient.latitude,
                            longitude: fullClient.longitude,
                        };
                    }
                }
                else {
                    console.log(`⚠️ Client ${client.id} not found in database`);
                }
            }
            catch (error) {
                console.error(`❌ Error fetching client coordinates for client ${client.id}:`, error);
            }
            const fallback = this.getFallbackCoordinates(client.countryId || 1);
            console.log(`⚠️ Client ${client.id} using fallback coordinates:`, fallback);
            return {
                ...client,
                latitude: fallback.latitude,
                longitude: fallback.longitude,
            };
        }
        else {
            console.log(`✅ Client ${client.id} already has valid coordinates:`, { latitude: client.latitude, longitude: client.longitude });
        }
        return client;
    }
    async create(createJourneyPlanDto, userId) {
        console.log('🚀 Creating new journey plan...');
        console.log('📊 Journey plan data:', createJourneyPlanDto);
        console.log('👤 User ID:', userId);
        const journeyPlan = this.journeyPlanRepository.create({
            ...createJourneyPlanDto,
            userId: userId,
            status: 0,
            date: new Date(createJourneyPlanDto.date),
        });
        const saved = await this.journeyPlanRepository.save(journeyPlan);
        console.log('✅ Journey plan created with ID:', saved.id);
        console.log('🏪 Client ID:', saved.clientId);
        if (userId && saved.clientId) {
            console.log('🔄 Updating client route to match sales rep route...');
            await this.updateClientRoute(saved.clientId, userId);
        }
        else {
            console.log('⚠️ Skipping client route update - missing userId or clientId');
        }
        return this.findOne(saved.id);
    }
    async updateClientRoute(clientId, salesRepId) {
        try {
            const salesRep = await this.salesRepRepository.findOne({
                where: { id: salesRepId },
                select: ['route_id', 'route']
            });
            if (!salesRep) {
                console.log(`⚠️ SalesRep with ID ${salesRepId} not found`);
                return;
            }
            await this.clientsRepository.update(clientId, {
                route_id: salesRep.route_id,
                route_name: salesRep.route,
                route_id_update: salesRep.route_id,
                route_name_update: salesRep.route,
            });
            console.log(`✅ Updated client ${clientId} route to match sales rep ${salesRepId}`);
            console.log(`   - New route_id: ${salesRep.route_id}`);
            console.log(`   - New route_name: ${salesRep.route}`);
        }
        catch (error) {
            console.error(`❌ Error updating client route: ${error}`);
        }
    }
    async findAllWithProcedure(options) {
        try {
            const { page, limit, status, date, userId, timezone } = options;
            const offset = (page - 1) * limit;
            const statusMap = {
                'pending': 0,
                'checked_in': 1,
                'in_progress': 2,
                'completed': 3,
                'cancelled': 4,
            };
            const statusValue = status ? (statusMap[status] ?? -1) : -1;
            const targetDate = date || new Date().toISOString().split('T')[0];
            console.log('🚀 Using stored procedure for journey plans');
            console.log('📊 Params:', { userId, statusValue, targetDate, page, limit, offset });
            const result = await this.dataSource.query('CALL GetJourneyPlans(?, ?, ?, ?, ?, ?)', [userId || 0, statusValue, targetDate, page, limit, offset]);
            if (result && result.length > 0) {
                const rawData = result[0];
                const total = result[1]?.[0]?.total || 0;
                const data = await Promise.all(rawData.map(async (row) => {
                    const journeyPlan = {};
                    const client = {};
                    const user = {};
                    Object.keys(row).forEach(key => {
                        if (key.startsWith('client.')) {
                            const clientKey = key.replace('client.', '');
                            client[clientKey] = row[key];
                        }
                        else if (key.startsWith('user.')) {
                            const userKey = key.replace('user.', '');
                            user[userKey] = row[key];
                        }
                        else {
                            journeyPlan[key] = row[key];
                        }
                    });
                    return {
                        ...journeyPlan,
                        client: await this.ensureClientCoordinates(client),
                        user,
                    };
                }));
                console.log('✅ Stored procedure executed successfully');
                console.log('📊 Total found:', total);
                console.log('📊 Data length:', data.length);
                return {
                    data,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                    },
                    success: true,
                };
            }
            else {
                throw new Error('No results from stored procedure');
            }
        }
        catch (error) {
            console.log('⚠️ Stored procedure disabled, using service method instead');
            return this.findAll(options);
        }
    }
    async findAll(options) {
        const { page, limit, status, date, userId, timezone } = options;
        const offset = (page - 1) * limit;
        console.log('🚀 Using service method for journey plans (stored procedure disabled)');
        console.log('📊 Params:', { userId, status, date, page, limit, offset });
        let query = this.journeyPlanRepository
            .createQueryBuilder('journeyPlan')
            .leftJoinAndSelect('journeyPlan.client', 'client')
            .leftJoinAndSelect('journeyPlan.user', 'user')
            .select([
            'journeyPlan.id',
            'journeyPlan.date',
            'journeyPlan.time',
            'journeyPlan.userId',
            'journeyPlan.clientId',
            'journeyPlan.status',
            'journeyPlan.checkInTime',
            'journeyPlan.latitude',
            'journeyPlan.longitude',
            'journeyPlan.imageUrl',
            'journeyPlan.notes',
            'journeyPlan.checkoutLatitude',
            'journeyPlan.checkoutLongitude',
            'journeyPlan.checkoutTime',
            'journeyPlan.showUpdateLocation',
            'journeyPlan.routeId',
            'client.id',
            'client.name',
            'client.address',
            'client.contact',
            'client.email',
            'client.latitude',
            'client.longitude',
            'client.region_id',
            'client.region',
            'client.countryId',
            'client.status',
            'client.tax_pin',
            'client.location',
            'client.client_type',
            'client.outlet_account',
            'client.balance',
            'client.created_at',
            'user.id',
            'user.name',
            'user.email',
            'user.phoneNumber',
            'user.role',
            'user.status',
            'user.countryId',
            'user.region_id',
            'user.route_id',
            'user.route',
            'user.createdAt',
            'user.updatedAt'
        ]);
        if (userId) {
            query = query.where('journeyPlan.userId = :userId', { userId });
        }
        if (status) {
            const statusMap = {
                'pending': 0,
                'checked_in': 1,
                'in_progress': 2,
                'completed': 3,
                'cancelled': 4,
            };
            const statusValue = statusMap[status] ?? 0;
            query = query.andWhere('journeyPlan.status = :status', { status: statusValue });
        }
        const targetDate = date || new Date().toISOString().split('T')[0];
        const startOfDay = new Date(targetDate);
        const endOfDay = new Date(targetDate);
        endOfDay.setDate(endOfDay.getDate() + 1);
        console.log('🔍 Journey Plans Filter Debug:');
        console.log('🔍 Target Date:', targetDate);
        console.log('🔍 Start of Day:', startOfDay);
        console.log('🔍 End of Day:', endOfDay);
        console.log('🔍 User ID:', userId);
        console.log('🔍 Status:', status);
        query = query.andWhere('journeyPlan.date >= :startDate AND journeyPlan.date < :endDate', {
            startDate: startOfDay,
            endDate: endOfDay,
        });
        const total = await query.getCount();
        const data = await query
            .orderBy('journeyPlan.date', 'DESC')
            .addOrderBy('journeyPlan.time', 'DESC')
            .skip(offset)
            .take(limit)
            .getMany();
        const fixedData = await Promise.all(data.map(async (journeyPlan) => ({
            ...journeyPlan,
            client: await this.ensureClientCoordinates(journeyPlan.client),
        })));
        const totalPages = Math.ceil(total / limit);
        console.log('🔍 Journey Plans Results:');
        console.log('🔍 Total found:', total);
        console.log('🔍 Data length:', fixedData.length);
        console.log('🔍 First journey plan date:', fixedData[0]?.date);
        console.log('🔍 Sample client data:', fixedData[0]?.client ? {
            id: fixedData[0].client.id,
            name: fixedData[0].client.name,
            latitude: fixedData[0].client.latitude,
            longitude: fixedData[0].client.longitude
        } : 'No client data');
        return {
            data: fixedData,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
            success: true,
        };
    }
    async findByDateRange(options) {
        const { page, limit, status, startDate, endDate, userId } = options;
        const offset = (page - 1) * limit;
        let query = this.journeyPlanRepository
            .createQueryBuilder('journeyPlan')
            .leftJoinAndSelect('journeyPlan.client', 'client')
            .leftJoinAndSelect('journeyPlan.user', 'user');
        if (userId) {
            query = query.where('journeyPlan.userId = :userId', { userId });
        }
        if (status) {
            const statusMap = {
                'pending': 0,
                'checked_in': 1,
                'in_progress': 2,
                'completed': 3,
                'cancelled': 4,
            };
            const statusValue = statusMap[status] ?? 0;
            query = query.andWhere('journeyPlan.status = :status', { status: statusValue });
        }
        const startOfRange = new Date(startDate);
        const endOfRange = new Date(endDate);
        endOfRange.setDate(endOfRange.getDate() + 1);
        query = query.andWhere('journeyPlan.date >= :startDate AND journeyPlan.date < :endDate', {
            startDate: startOfRange,
            endDate: endOfRange,
        });
        const total = await query.getCount();
        const data = await query
            .orderBy('journeyPlan.date', 'DESC')
            .addOrderBy('journeyPlan.time', 'DESC')
            .skip(offset)
            .take(limit)
            .getMany();
        const fixedData = await Promise.all(data.map(async (journeyPlan) => ({
            ...journeyPlan,
            client: await this.ensureClientCoordinates(journeyPlan.client),
        })));
        const totalPages = Math.ceil(total / limit);
        return {
            data: fixedData,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
            success: true,
        };
    }
    async findOne(id) {
        const journeyPlan = await this.journeyPlanRepository.findOne({
            where: { id },
            relations: ['client', 'user'],
        });
        if (journeyPlan && journeyPlan.client) {
            journeyPlan.client = await this.ensureClientCoordinates(journeyPlan.client);
        }
        return journeyPlan;
    }
    async update(id, updateJourneyPlanDto) {
        const journeyPlan = await this.findOne(id);
        if (!journeyPlan) {
            throw new common_1.NotFoundException(`Journey plan with ID ${id} not found`);
        }
        let statusValue;
        if (updateJourneyPlanDto.status) {
            const statusMap = {
                'pending': 0,
                'checked_in': 1,
                'in_progress': 2,
                'completed': 3,
                'cancelled': 4,
            };
            statusValue = statusMap[updateJourneyPlanDto.status] ?? 0;
        }
        const updateData = { ...updateJourneyPlanDto };
        if (statusValue !== undefined) {
            updateData.status = statusValue;
        }
        if (updateData.checkInTime) {
            updateData.checkInTime = new Date(updateData.checkInTime);
        }
        if (updateData.checkoutTime) {
            updateData.checkoutTime = new Date(updateData.checkoutTime);
        }
        await this.journeyPlanRepository.update(id, updateData);
        return this.findOne(id);
    }
    async uploadCheckInPhoto(journeyPlanId, file) {
        this.logger.log(`📸 Starting check-in photo upload for journey plan ${journeyPlanId}`);
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('File size must be less than 5MB');
        }
        try {
            const journeyPlan = await this.findOne(journeyPlanId);
            if (!journeyPlan) {
                throw new common_1.NotFoundException(`Journey plan with ID ${journeyPlanId} not found`);
            }
            const uploadResult = await this.cloudinaryService.uploadToCloudinary(file.buffer, {
                folder: 'whoosh/checkin_photos',
                mimetype: file.mimetype,
                public_id: `checkin_${journeyPlanId}_${Date.now()}`,
            });
            this.logger.log(`✅ Check-in photo uploaded successfully: ${uploadResult.url}`);
            await this.journeyPlanRepository.update(journeyPlanId, {
                imageUrl: uploadResult.url,
            });
            this.logger.log(`✅ Journey plan ${journeyPlanId} updated with photo URL: ${uploadResult.url}`);
            return uploadResult.url;
        }
        catch (error) {
            this.logger.error(`❌ Error uploading check-in photo for journey plan ${journeyPlanId}:`, error);
            throw error;
        }
    }
    async remove(id) {
        const journeyPlan = await this.findOne(id);
        if (!journeyPlan) {
            throw new common_1.NotFoundException(`Journey plan with ID ${id} not found`);
        }
        await this.journeyPlanRepository.delete(id);
    }
    async checkout(id, checkoutDto) {
        const journeyPlan = await this.findOne(id);
        if (!journeyPlan) {
            throw new common_1.NotFoundException(`Journey plan with ID ${id} not found`);
        }
        const updateData = {
            status: 3,
            checkoutTime: checkoutDto.checkoutTime ? new Date(checkoutDto.checkoutTime) : new Date(),
        };
        if (checkoutDto.checkoutLatitude !== undefined) {
            updateData.checkoutLatitude = checkoutDto.checkoutLatitude;
        }
        if (checkoutDto.checkoutLongitude !== undefined) {
            updateData.checkoutLongitude = checkoutDto.checkoutLongitude;
        }
        await this.journeyPlanRepository.update(id, updateData);
        return this.findOne(id);
    }
};
exports.JourneyPlansService = JourneyPlansService;
exports.JourneyPlansService = JourneyPlansService = JourneyPlansService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(journey_plan_entity_1.JourneyPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(clients_entity_1.Clients)),
    __param(2, (0, typeorm_1.InjectRepository)(sales_rep_entity_1.SalesRep)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        cloudinary_service_1.CloudinaryService])
], JourneyPlansService);
//# sourceMappingURL=journey-plans.service.js.map