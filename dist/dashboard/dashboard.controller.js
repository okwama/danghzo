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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const dashboard_service_1 = require("./dashboard.service");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getSummary(req, userId, date) {
        const enabled = (process.env.USE_CONSOLIDATED_DASHBOARD ?? 'true').toLowerCase() !== 'false';
        if (!enabled) {
            throw new common_1.ServiceUnavailableException('Consolidated dashboard is temporarily disabled');
        }
        const requesterId = parseInt(req.user?.sub || req.user?.id, 10);
        const requestedUserId = parseInt(userId ?? String(requesterId), 10);
        const isAdmin = typeof req.user?.role === 'string' && req.user.role.toUpperCase().includes('ADMIN');
        if (!isAdmin && requestedUserId !== requesterId) {
            throw new common_1.ForbiddenException('You are not allowed to access other users\' data');
        }
        const resolvedUserId = requestedUserId;
        const resolvedDate = date ?? new Date().toISOString().slice(0, 10);
        const cards = await this.dashboardService.getSummary(resolvedUserId, resolvedDate);
        return {
            userId: resolvedUserId,
            date: resolvedDate,
            cards,
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, cache_manager_1.CacheTTL)(60),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSummary", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map