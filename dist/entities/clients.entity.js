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
exports.Clients = void 0;
const typeorm_1 = require("typeorm");
const journey_plan_entity_1 = require("../journey-plans/entities/journey-plan.entity");
const uplift_sale_entity_1 = require("./uplift-sale.entity");
const sales_rep_entity_1 = require("./sales-rep.entity");
const client_assignment_entity_1 = require("./client-assignment.entity");
let Clients = class Clients {
};
exports.Clients = Clients;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Clients.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Clients.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Clients.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Clients.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Clients.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Clients.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Clients.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Clients.prototype, "region_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Clients.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Clients.prototype, "route_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Clients.prototype, "route_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Number)
], Clients.prototype, "route_id_update", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Clients.prototype, "route_name_update", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Clients.prototype, "contact", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Clients.prototype, "tax_pin", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Clients.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Clients.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Clients.prototype, "client_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Clients.prototype, "outlet_account", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 2 }),
    __metadata("design:type", Number)
], Clients.prototype, "credit_limit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Clients.prototype, "payment_terms", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Clients.prototype, "countryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Clients.prototype, "added_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sales_rep_entity_1.SalesRep, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'added_by' }),
    __metadata("design:type", sales_rep_entity_1.SalesRep)
], Clients.prototype, "addedByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Clients.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => journey_plan_entity_1.JourneyPlan, journeyPlan => journeyPlan.client),
    __metadata("design:type", Array)
], Clients.prototype, "journeyPlans", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => uplift_sale_entity_1.UpliftSale, upliftSale => upliftSale.client),
    __metadata("design:type", Array)
], Clients.prototype, "upliftSales", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => client_assignment_entity_1.ClientAssignment, assignment => assignment.client),
    __metadata("design:type", Array)
], Clients.prototype, "assignments", void 0);
exports.Clients = Clients = __decorate([
    (0, typeorm_1.Entity)('Clients'),
    (0, typeorm_1.Index)('Clients_countryId_fkey', ['countryId']),
    (0, typeorm_1.Index)('idx_country_status_route', ['countryId', 'status', 'route_id'])
], Clients);
//# sourceMappingURL=clients.entity.js.map