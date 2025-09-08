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
exports.OutletsController = void 0;
const common_1 = require("@nestjs/common");
const clients_service_1 = require("./clients.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let OutletsController = class OutletsController {
    constructor(clientsService) {
        this.clientsService = clientsService;
    }
    async getOutlet(id, req) {
        const client = await this.clientsService.findOne(+id, req.user.countryId);
        if (!client) {
            return null;
        }
        if (client.latitude === null || client.longitude === null) {
            const fallbackCoordinates = this.getFallbackCoordinates(client.countryId || 1);
            console.log(`⚠️ Client ${client.id} has null coordinates, using fallback:`, fallbackCoordinates);
            client.latitude = fallbackCoordinates.latitude;
            client.longitude = fallbackCoordinates.longitude;
        }
        return {
            id: client.id,
            name: client.name,
            address: client.address,
            contact: client.contact,
            email: client.email,
            latitude: client.latitude,
            longitude: client.longitude,
            regionId: client.region_id,
            region: client.region,
            countryId: client.countryId,
            status: client.status,
            taxPin: client.tax_pin,
            location: client.location,
            clientType: client.client_type,
            outletAccount: client.outlet_account,
            balance: client.balance,
            createdAt: client.created_at,
        };
    }
    async createOutlet(body, req) {
        const createClientDto = {
            name: body.name,
            address: body.address,
            taxPin: body.tax_pin,
            email: body.email,
            contact: body.contact,
            latitude: body.latitude,
            longitude: body.longitude,
            location: body.location,
            clientType: body.client_type,
            regionId: body.region_id,
            region: body.region,
            routeId: body.route_id,
            routeName: body.route_name,
            routeIdUpdate: body.route_id_update,
            routeNameUpdate: body.route_name_update,
            balance: body.balance,
            outletAccount: body.outlet_account,
            countryId: body.country || req.user.countryId,
            addedBy: req.user.id,
        };
        const client = await this.clientsService.create(createClientDto, req.user.countryId, req.user.id);
        return {
            id: client.id,
            name: client.name,
            address: client.address,
            contact: client.contact,
            email: client.email,
            latitude: client.latitude,
            longitude: client.longitude,
            regionId: client.region_id,
            region: client.region,
            countryId: client.countryId,
            status: client.status,
            taxPin: client.tax_pin,
            location: client.location,
            clientType: client.client_type,
            outletAccount: client.outlet_account,
            balance: client.balance,
            createdAt: client.created_at,
        };
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
};
exports.OutletsController = OutletsController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OutletsController.prototype, "getOutlet", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OutletsController.prototype, "createOutlet", null);
exports.OutletsController = OutletsController = __decorate([
    (0, common_1.Controller)('outlets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [clients_service_1.ClientsService])
], OutletsController);
//# sourceMappingURL=outlets.controller.js.map