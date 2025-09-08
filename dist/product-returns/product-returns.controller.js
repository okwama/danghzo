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
exports.ProductReturnsController = void 0;
const common_1 = require("@nestjs/common");
const product_returns_service_1 = require("./product-returns.service");
const create_product_return_dto_1 = require("./dto/create-product-return.dto");
const update_product_return_dto_1 = require("./dto/update-product-return.dto");
const return_status_dto_1 = require("./dto/return-status.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ProductReturnsController = class ProductReturnsController {
    constructor(productReturnsService) {
        this.productReturnsService = productReturnsService;
    }
    create(createProductReturnDto) {
        return this.productReturnsService.create(createProductReturnDto);
    }
    findAll() {
        return this.productReturnsService.findAll();
    }
    getStats() {
        return this.productReturnsService.getReturnStats();
    }
    findBySalesRep(salesrepId) {
        return this.productReturnsService.findBySalesRep(salesrepId);
    }
    findByClient(clientId) {
        return this.productReturnsService.findByClient(clientId);
    }
    findByProduct(productId) {
        return this.productReturnsService.getReturnsByProduct(productId);
    }
    findByStatus(status) {
        return this.productReturnsService.findByStatus(status);
    }
    findByDateRange(startDate, endDate) {
        return this.productReturnsService.findByDateRange(startDate, endDate);
    }
    findOne(id) {
        return this.productReturnsService.findOne(id);
    }
    update(id, updateProductReturnDto) {
        return this.productReturnsService.update(id, updateProductReturnDto);
    }
    updateStatus(id, updateStatusDto) {
        return this.productReturnsService.updateStatus(id, updateStatusDto);
    }
    remove(id) {
        return this.productReturnsService.remove(id);
    }
};
exports.ProductReturnsController = ProductReturnsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_return_dto_1.CreateProductReturnDto]),
    __metadata("design:returntype", void 0)
], ProductReturnsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductReturnsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductReturnsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('salesrep/:salesrepId'),
    __param(0, (0, common_1.Param)('salesrepId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductReturnsController.prototype, "findBySalesRep", null);
__decorate([
    (0, common_1.Get)('client/:clientId'),
    __param(0, (0, common_1.Param)('clientId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductReturnsController.prototype, "findByClient", null);
__decorate([
    (0, common_1.Get)('product/:productId'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductReturnsController.prototype, "findByProduct", null);
__decorate([
    (0, common_1.Get)('status/:status'),
    __param(0, (0, common_1.Param)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductReturnsController.prototype, "findByStatus", null);
__decorate([
    (0, common_1.Get)('date-range'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProductReturnsController.prototype, "findByDateRange", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductReturnsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_return_dto_1.UpdateProductReturnDto]),
    __metadata("design:returntype", void 0)
], ProductReturnsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, return_status_dto_1.UpdateReturnStatusDto]),
    __metadata("design:returntype", void 0)
], ProductReturnsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductReturnsController.prototype, "remove", null);
exports.ProductReturnsController = ProductReturnsController = __decorate([
    (0, common_1.Controller)('product-returns'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [product_returns_service_1.ProductReturnsService])
], ProductReturnsController);
//# sourceMappingURL=product-returns.controller.js.map