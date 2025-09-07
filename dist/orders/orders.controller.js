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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const users_service_1 = require("../users/users.service");
let OrdersController = class OrdersController {
    constructor(ordersService, usersService) {
        this.ordersService = ordersService;
        this.usersService = usersService;
    }
    async create(createOrderDto, req) {
        console.log('🔍 Received order data:', JSON.stringify(createOrderDto, null, 2));
        const salesrepId = req.user?.sub || req.user?.id;
        let salesrepName = 'Unknown Sales Rep';
        try {
            const salesRep = await this.usersService.findById(salesrepId);
            if (salesRep) {
                salesrepName = salesRep.name;
            }
        }
        catch (error) {
            console.error('❌ Error fetching sales rep name:', error);
        }
        const result = await this.ordersService.create(createOrderDto, salesrepId, salesrepName);
        return {
            success: true,
            data: result.order,
            warning: result.creditLimitWarning
        };
    }
    async findAll(req, page = '1', limit = '10', status, clientId, startDate, endDate) {
        const salesrepId = req.user?.sub || req.user?.id;
        if (!salesrepId) {
            return {
                success: false,
                message: 'Sales representative ID not found in token',
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            };
        }
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const filters = {
            page: pageNum,
            limit: limitNum,
        };
        if (status)
            filters.status = status;
        if (clientId)
            filters.clientId = parseInt(clientId, 10);
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        const result = await this.ordersService.findAll(salesrepId, filters);
        return {
            success: true,
            data: result.orders,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    }
    async findOne(id, req) {
        const salesrepId = req.user?.sub || req.user?.id;
        if (!salesrepId) {
            return {
                success: false,
                message: 'Sales representative ID not found in token',
                data: null
            };
        }
        const order = await this.ordersService.findOne(+id, salesrepId);
        if (!order) {
            return {
                success: false,
                message: 'Order not found or access denied',
                data: null
            };
        }
        return {
            success: true,
            data: order
        };
    }
    async update(id, updateOrderDto) {
        const order = await this.ordersService.update(+id, updateOrderDto);
        return {
            success: true,
            data: order
        };
    }
    remove(id) {
        return this.ordersService.remove(+id);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('clientId')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "remove", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        users_service_1.UsersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map