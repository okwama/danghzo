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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitorReport = void 0;
const typeorm_1 = require("typeorm");
const sales_rep_entity_1 = require("./sales-rep.entity");
const clients_entity_1 = require("./clients.entity");
let CompetitorReport = class CompetitorReport {
};
exports.CompetitorReport = CompetitorReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CompetitorReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reportId', nullable: true }),
    __metadata("design:type", Number)
], CompetitorReport.prototype, "reportId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'competitorName', nullable: true }),
    __metadata("design:type", String)
], CompetitorReport.prototype, "competitorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'productName', nullable: true }),
    __metadata("design:type", String)
], CompetitorReport.prototype, "productName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CompetitorReport.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity', nullable: true }),
    __metadata("design:type", Number)
], CompetitorReport.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'promotion', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CompetitorReport.prototype, "promotion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comment', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CompetitorReport.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'imageUrl', nullable: true }),
    __metadata("design:type", String)
], CompetitorReport.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'createdAt' }),
    __metadata("design:type", Date)
], CompetitorReport.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clientId' }),
    __metadata("design:type", Number)
], CompetitorReport.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'userId' }),
    __metadata("design:type", Number)
], CompetitorReport.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sales_rep_entity_1.SalesRep),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", sales_rep_entity_1.SalesRep)
], CompetitorReport.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => clients_entity_1.Clients),
    (0, typeorm_1.JoinColumn)({ name: 'clientId' }),
    __metadata("design:type", clients_entity_1.Clients)
], CompetitorReport.prototype, "client", void 0);
exports.CompetitorReport = CompetitorReport = __decorate([
    (0, typeorm_1.Entity)('CompetitorReport')
], CompetitorReport);
//# sourceMappingURL=competitor-report.entity.js.map