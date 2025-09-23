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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let DashboardService = class DashboardService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getSummary(userId, date) {
        const raw = await this.dataSource.manager.query('CALL sp_dashboard_summary(?, ?)', [userId, date]);
        const rows = Array.isArray(raw)
            ? (Array.isArray(raw[0]) ? raw[0] : raw)
            : [];
        const cards = rows.map((r) => ({
            id: String(r.id),
            title: String(r.title),
            mainValue: String(r.mainValue),
            subValue: r.subValue != null ? String(r.subValue) : null,
            trend: r.trend != null ? String(r.trend) : null,
            type: String(r.type),
            status: r.status != null ? String(r.status) : 'normal',
        }));
        return cards;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map