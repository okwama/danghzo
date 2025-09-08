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
exports.ProductReturn = void 0;
const typeorm_1 = require("typeorm");
const sales_rep_entity_1 = require("../../entities/sales-rep.entity");
const product_entity_1 = require("../../entities/product.entity");
const clients_entity_1 = require("../../entities/clients.entity");
let ProductReturn = class ProductReturn {
};
exports.ProductReturn = ProductReturn;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProductReturn.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salesrepId', type: 'int' }),
    __metadata("design:type", Number)
], ProductReturn.prototype, "salesrepId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sales_rep_entity_1.SalesRep),
    (0, typeorm_1.JoinColumn)({ name: 'salesrepId' }),
    __metadata("design:type", sales_rep_entity_1.SalesRep)
], ProductReturn.prototype, "salesrep", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'productId', type: 'int' }),
    __metadata("design:type", Number)
], ProductReturn.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product),
    (0, typeorm_1.JoinColumn)({ name: 'productId' }),
    __metadata("design:type", product_entity_1.Product)
], ProductReturn.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qty', type: 'int' }),
    __metadata("design:type", Number)
], ProductReturn.prototype, "qty", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clientId', type: 'int' }),
    __metadata("design:type", Number)
], ProductReturn.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => clients_entity_1.Clients),
    (0, typeorm_1.JoinColumn)({ name: 'clientId' }),
    __metadata("design:type", clients_entity_1.Clients)
], ProductReturn.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date', type: 'date' }),
    __metadata("design:type", Date)
], ProductReturn.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: ['pending', 'approved', 'rejected', 'processed'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], ProductReturn.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'imageUrl', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ProductReturn.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProductReturn.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProductReturn.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], ProductReturn.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], ProductReturn.prototype, "updatedAt", void 0);
exports.ProductReturn = ProductReturn = __decorate([
    (0, typeorm_1.Entity)('product_returns')
], ProductReturn);
//# sourceMappingURL=product-return.entity.js.map