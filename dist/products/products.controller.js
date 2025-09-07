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
exports.HealthController = exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let ProductsController = class ProductsController {
    constructor(productsService, dataSource) {
        this.productsService = productsService;
        this.dataSource = dataSource;
    }
    async findAll() {
        try {
            console.log('📦 Products API: GET /products called');
            const products = await this.productsService.findAll();
            console.log(`📦 Products API: Returning ${products.length} products`);
            return products;
        }
        catch (error) {
            console.error('❌ Products API Error:', error);
            throw error;
        }
    }
    async findProductsByCountry(req) {
        try {
            console.log('🌍 Products API: GET /products/country called');
            const userCountryId = req.user?.countryId;
            if (!userCountryId) {
                throw new Error('Country ID not found in user token');
            }
            console.log(`🌍 Products API: User country from JWT: ${userCountryId}`);
            const products = await this.productsService.findProductsByCountry(userCountryId);
            console.log(`🌍 Products API: Returning ${products.length} products for country ${userCountryId}`);
            return products;
        }
        catch (error) {
            console.error('❌ Products API Error:', error);
            throw error;
        }
    }
    async findOne(id) {
        return this.productsService.findOne(+id);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('country'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findProductsByCountry", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findOne", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __param(1, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        typeorm_2.DataSource])
], ProductsController);
let HealthController = class HealthController {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async productsHealthCheck() {
        try {
            console.log('🏥 Products Health Check: Testing database connection...');
            const result = await this.dataSource.query('SELECT 1 as test');
            console.log('✅ Database connection successful:', result);
            return { status: 'healthy', database: 'connected', timestamp: new Date().toISOString() };
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            return { status: 'unhealthy', database: 'disconnected', error: error.message, timestamp: new Date().toISOString() };
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "productsHealthCheck", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], HealthController);
//# sourceMappingURL=products.controller.js.map