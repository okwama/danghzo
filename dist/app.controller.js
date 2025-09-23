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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
let AppController = class AppController {
    getRoot() {
        return {
            message: 'Niaje! 🚀 API is running smoothly',
            status: 'online',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            endpoints: {
                auth: '/api/auth',
                clients: '/api/clients',
                products: '/api/products',
                orders: '/api/orders',
                analytics: '/api/analytics',
                health: '/api/health',
                ping: '/api/ping'
            },
            documentation: 'Check the server_doc folder for API documentation'
        };
    }
    getHealth() {
        return {
            status: 'healthy',
            message: 'API is running perfectly! 💪',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        };
    }
    getPing() {
        return {
            status: 'pong',
            message: 'API is alive! 🏓',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        };
    }
    getFavicon(res) {
        res.status(204).send();
    }
    getFaviconPng(res) {
        res.status(204).send();
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRoot", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getPing", null);
__decorate([
    (0, common_1.Get)('favicon.ico'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getFavicon", null);
__decorate([
    (0, common_1.Get)('favicon.png'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getFaviconPng", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
//# sourceMappingURL=app.controller.js.map