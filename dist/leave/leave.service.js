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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const leave_entity_1 = require("../entities/leave.entity");
const leave_type_entity_1 = require("../entities/leave-type.entity");
const leave_request_entity_1 = require("../entities/leave-request.entity");
const typeorm_2 = require("typeorm");
let LeaveService = class LeaveService {
    constructor(leaveRepository, leaveTypeRepository, leaveRequestRepository) {
        this.leaveRepository = leaveRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }
    async findAll(query) {
        const queryBuilder = this.leaveRepository.createQueryBuilder('leave');
        if (query.userId) {
            queryBuilder.where('leave.userId = :userId', { userId: query.userId });
        }
        if (query.status) {
            queryBuilder.andWhere('leave.status = :status', { status: query.status });
        }
        return queryBuilder.orderBy('leave.createdAt', 'DESC').getMany();
    }
    async findOne(id) {
        return this.leaveRepository.findOne({ where: { id } });
    }
    async create(createLeaveDto) {
        try {
            if (createLeaveDto.startDate && typeof createLeaveDto.startDate === 'string') {
                createLeaveDto.startDate = new Date(createLeaveDto.startDate);
            }
            if (createLeaveDto.endDate && typeof createLeaveDto.endDate === 'string') {
                createLeaveDto.endDate = new Date(createLeaveDto.endDate);
            }
            if (!createLeaveDto.userId || !createLeaveDto.leaveType || !createLeaveDto.startDate || !createLeaveDto.endDate) {
                throw new Error('Missing required fields: userId, leaveType, startDate, endDate');
            }
            if (typeof createLeaveDto.reason === 'string' && createLeaveDto.reason.trim() === '') {
                createLeaveDto.reason = null;
            }
            const leave = this.leaveRepository.create(createLeaveDto);
            const result = await this.leaveRepository.save(leave);
            try {
                await this.createLeaveRequest(createLeaveDto);
            }
            catch (error) {
                console.error('Error creating leave request entry:', error);
            }
            return Array.isArray(result) ? result[0] : result;
        }
        catch (error) {
            console.error('Error creating leave application:', error);
            throw error;
        }
    }
    async createLeaveRequest(createLeaveDto) {
        try {
            const leaveType = await this.leaveTypeRepository.findOne({
                where: { name: createLeaveDto.leaveType }
            });
            if (!leaveType) {
                throw new Error(`Leave type '${createLeaveDto.leaveType}' not found`);
            }
            const leaveRequestData = {
                employee_id: null,
                leave_type_id: leaveType.id,
                start_date: createLeaveDto.startDate,
                end_date: createLeaveDto.endDate,
                reason: createLeaveDto.reason,
                attachment_url: createLeaveDto.attachment || null,
                status: 'pending',
                employee_type_id: null,
                salesrep: createLeaveDto.userId,
            };
            const leaveRequest = this.leaveRequestRepository.create(leaveRequestData);
            const result = await this.leaveRequestRepository.save(leaveRequest);
            return Array.isArray(result) ? result[0] : result;
        }
        catch (error) {
            console.error('Error creating leave request:', error);
            throw error;
        }
    }
    async update(id, updateLeaveDto) {
        await this.leaveRepository.update(id, updateLeaveDto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.leaveRepository.delete(id);
    }
    async getLeaveTypes() {
        return this.leaveTypeRepository.find({ where: { is_active: true } });
    }
    async getLeaveBalance(userId) {
        const leaveTypes = await this.getLeaveTypes();
        const approvedLeaves = await this.leaveRepository.find({
            where: { userId, status: 'APPROVED' },
        });
        const balance = {};
        for (const leaveType of leaveTypes) {
            const usedDays = approvedLeaves
                .filter(leave => leave.leaveType === leaveType.name)
                .reduce((total, leave) => total + leave.durationInDays, 0);
            balance[leaveType.name] = {
                totalDays: leaveType.default_days,
                usedDays,
                remainingDays: leaveType.default_days - usedDays,
            };
        }
        return balance;
    }
    async ensureLeaveTypeExists(leaveTypeName) {
        try {
            const existingType = await this.leaveTypeRepository.findOne({
                where: { name: leaveTypeName }
            });
            if (!existingType) {
                const newLeaveType = this.leaveTypeRepository.create({
                    name: leaveTypeName,
                    description: `${leaveTypeName} leave type`,
                    default_days: 5,
                    is_active: true,
                });
                await this.leaveTypeRepository.save(newLeaveType);
                console.log(`Created leave type: ${leaveTypeName}`);
            }
        }
        catch (error) {
            console.error('Error ensuring leave type exists:', error);
        }
    }
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(leave_entity_1.Leave)),
    __param(1, (0, typeorm_1.InjectRepository)(leave_type_entity_1.LeaveType)),
    __param(2, (0, typeorm_1.InjectRepository)(leave_request_entity_1.LeaveRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LeaveService);
//# sourceMappingURL=leave.service.js.map