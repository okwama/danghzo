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
exports.ClientAssignment = void 0;
const typeorm_1 = require("typeorm");
const clients_entity_1 = require("./clients.entity");
const sales_rep_entity_1 = require("./sales-rep.entity");
let ClientAssignment = class ClientAssignment {
};
exports.ClientAssignment = ClientAssignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ClientAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'outletId' }),
    __metadata("design:type", Number)
], ClientAssignment.prototype, "outletId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salesRepId' }),
    __metadata("design:type", Number)
], ClientAssignment.prototype, "salesRepId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assignedAt', type: 'datetime', precision: 3 }),
    __metadata("design:type", Date)
], ClientAssignment.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'active' }),
    __metadata("design:type", String)
], ClientAssignment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => clients_entity_1.Clients, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'outletId' }),
    __metadata("design:type", clients_entity_1.Clients)
], ClientAssignment.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sales_rep_entity_1.SalesRep, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'salesRepId' }),
    __metadata("design:type", sales_rep_entity_1.SalesRep)
], ClientAssignment.prototype, "salesRep", void 0);
exports.ClientAssignment = ClientAssignment = __decorate([
    (0, typeorm_1.Entity)('ClientAssignment'),
    (0, typeorm_1.Index)('ClientAssignment_salesRepId_idx', ['salesRepId']),
    (0, typeorm_1.Index)('ClientAssignment_outletId_idx', ['outletId']),
    (0, typeorm_1.Index)('ClientAssignment_outletId_salesRepId_key', ['outletId', 'salesRepId'])
], ClientAssignment);
//# sourceMappingURL=client-assignment.entity.js.map