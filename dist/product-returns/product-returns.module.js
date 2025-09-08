"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductReturnsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const product_returns_service_1 = require("./product-returns.service");
const product_returns_controller_1 = require("./product-returns.controller");
const product_return_entity_1 = require("./entities/product-return.entity");
let ProductReturnsModule = class ProductReturnsModule {
};
exports.ProductReturnsModule = ProductReturnsModule;
exports.ProductReturnsModule = ProductReturnsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([product_return_entity_1.ProductReturn])],
        controllers: [product_returns_controller_1.ProductReturnsController],
        providers: [product_returns_service_1.ProductReturnsService],
        exports: [product_returns_service_1.ProductReturnsService],
    })
], ProductReturnsModule);
//# sourceMappingURL=product-returns.module.js.map