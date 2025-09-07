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
exports.SalesRep = void 0;
const typeorm_1 = require("typeorm");
const journey_plan_entity_1 = require("../journey-plans/entities/journey-plan.entity");
const login_history_entity_1 = require("./login-history.entity");
const client_assignment_entity_1 = require("./client-assignment.entity");
const bcrypt = require("bcryptjs");
let SalesRep = class SalesRep {
    async validatePassword(password) {
        return bcrypt.compare(password, this.password);
    }
};
exports.SalesRep = SalesRep;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SalesRep.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SalesRep.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SalesRep.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SalesRep.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SalesRep.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SalesRep.prototype, "countryId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SalesRep.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SalesRep.prototype, "region_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SalesRep.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", Number)
], SalesRep.prototype, "route_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], SalesRep.prototype, "route", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SalesRep.prototype, "route_id_update", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], SalesRep.prototype, "route_name_update", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SalesRep.prototype, "visits_targets", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SalesRep.prototype, "new_clients", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SalesRep.prototype, "vapes_targets", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SalesRep.prototype, "pouches_targets", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 'USER' }),
    __metadata("design:type", String)
], SalesRep.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SalesRep.prototype, "manager_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 0 }),
    __metadata("design:type", Number)
], SalesRep.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], SalesRep.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], SalesRep.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SalesRep.prototype, "retail_manager", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SalesRep.prototype, "key_channel_manager", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SalesRep.prototype, "distribution_manager", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: '' }),
    __metadata("design:type", String)
], SalesRep.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], SalesRep.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => journey_plan_entity_1.JourneyPlan, journeyPlan => journeyPlan.user),
    __metadata("design:type", Array)
], SalesRep.prototype, "journeyPlans", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => login_history_entity_1.LoginHistory, loginHistory => loginHistory.SalesRep),
    __metadata("design:type", Array)
], SalesRep.prototype, "LoginHistory", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => client_assignment_entity_1.ClientAssignment, assignment => assignment.salesRep),
    __metadata("design:type", Array)
], SalesRep.prototype, "clientAssignments", void 0);
exports.SalesRep = SalesRep = __decorate([
    (0, typeorm_1.Entity)('SalesRep'),
    (0, typeorm_1.Index)('idx_status_role', ['status', 'role']),
    (0, typeorm_1.Index)('idx_location', ['countryId', 'region_id', 'route_id']),
    (0, typeorm_1.Index)('idx_manager', ['managerId']),
    (0, typeorm_1.Index)('SalesRep_countryId_fkey', ['countryId'])
], SalesRep);
//# sourceMappingURL=sales-rep.entity.js.map