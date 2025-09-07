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
exports.Order = void 0;
const typeorm_1 = require("typeorm");
const clients_entity_1 = require("../../entities/clients.entity");
const order_item_entity_1 = require("./order-item.entity");
let Order = class Order {
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'so_number', length: 20, unique: true }),
    __metadata("design:type", String)
], Order.prototype, "soNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_id', type: 'int' }),
    __metadata("design:type", Number)
], Order.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_date', type: 'date' }),
    __metadata("design:type", Date)
], Order.prototype, "orderDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_delivery_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Order.prototype, "expectedDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subtotal', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "taxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'net_price', type: 'decimal', precision: 11, scale: 2 }),
    __metadata("design:type", Number)
], Order.prototype, "netPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salesrep', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "salesrep", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rider_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "riderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Order.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['draft', 'confirmed', 'shipped', 'delivered', 'cancelled', 'in_payment', 'paid'], default: 'draft' }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'my_status', type: 'tinyint' }),
    __metadata("design:type", Number)
], Order.prototype, "myStatus", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => clients_entity_1.Clients),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", clients_entity_1.Clients)
], Order.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_item_entity_1.OrderItem, orderItem => orderItem.order),
    __metadata("design:type", Array)
], Order.prototype, "orderItems", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)('sales_orders')
], Order);
//# sourceMappingURL=order.entity.js.map