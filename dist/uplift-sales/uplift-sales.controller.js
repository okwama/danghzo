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
exports.UpliftSalesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const uplift_sales_service_1 = require("./uplift-sales.service");
const create_uplift_sale_dto_1 = require("./dto/create-uplift-sale.dto");
const update_uplift_sale_dto_1 = require("./dto/update-uplift-sale.dto");
let UpliftSalesController = class UpliftSalesController {
    constructor(upliftSalesService) {
        this.upliftSalesService = upliftSalesService;
    }
    async findAll(query) {
        return this.upliftSalesService.findAll(query);
    }
    async findOne(id) {
        return this.upliftSalesService.findOne(+id);
    }
    async create(createUpliftSaleDto, req) {
        console.log('🔍 UpliftSalesController: Received POST request with body:', JSON.stringify(createUpliftSaleDto, null, 2));
        console.log('🔍 UpliftSalesController: User from JWT:', req.user);
        const userId = req.user.id;
        console.log('🔍 UpliftSalesController: Extracted userId from JWT:', userId);
        return this.upliftSalesService.create(createUpliftSaleDto, userId);
    }
    async update(id, updateUpliftSaleDto) {
        return this.upliftSalesService.update(+id, updateUpliftSaleDto);
    }
    async remove(id) {
        return this.upliftSalesService.remove(+id);
    }
};
exports.UpliftSalesController = UpliftSalesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UpliftSalesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UpliftSalesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_uplift_sale_dto_1.CreateUpliftSaleDto, Object]),
    __metadata("design:returntype", Promise)
], UpliftSalesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_uplift_sale_dto_1.UpdateUpliftSaleDto]),
    __metadata("design:returntype", Promise)
], UpliftSalesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UpliftSalesController.prototype, "remove", null);
exports.UpliftSalesController = UpliftSalesController = __decorate([
    (0, common_1.Controller)('uplift-sales'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [uplift_sales_service_1.UpliftSalesService])
], UpliftSalesController);
//# sourceMappingURL=uplift-sales.controller.js.map