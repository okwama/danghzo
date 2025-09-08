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
exports.ProductReturnsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_return_entity_1 = require("./entities/product-return.entity");
let ProductReturnsService = class ProductReturnsService {
    constructor(productReturnRepository) {
        this.productReturnRepository = productReturnRepository;
    }
    async create(createProductReturnDto) {
        try {
            const productReturn = this.productReturnRepository.create({
                ...createProductReturnDto,
                date: new Date(createProductReturnDto.date),
            });
            return await this.productReturnRepository.save(productReturn);
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to create product return');
        }
    }
    async findAll() {
        return await this.productReturnRepository.find({
            relations: ['salesrep', 'product', 'client'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const productReturn = await this.productReturnRepository.findOne({
            where: { id },
            relations: ['salesrep', 'product', 'client'],
        });
        if (!productReturn) {
            throw new common_1.NotFoundException(`Product return with ID ${id} not found`);
        }
        return productReturn;
    }
    async findBySalesRep(salesrepId) {
        return await this.productReturnRepository.find({
            where: { salesrepId },
            relations: ['salesrep', 'product', 'client'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByClient(clientId) {
        return await this.productReturnRepository.find({
            where: { clientId },
            relations: ['salesrep', 'product', 'client'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByStatus(status) {
        return await this.productReturnRepository.find({
            where: { status },
            relations: ['salesrep', 'product', 'client'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByDateRange(startDate, endDate) {
        return await this.productReturnRepository.find({
            where: {
                date: (0, typeorm_2.Between)(new Date(startDate), new Date(endDate)),
            },
            relations: ['salesrep', 'product', 'client'],
            order: { date: 'DESC' },
        });
    }
    async update(id, updateProductReturnDto) {
        const productReturn = await this.findOne(id);
        Object.assign(productReturn, updateProductReturnDto);
        if (updateProductReturnDto.date) {
            productReturn.date = new Date(updateProductReturnDto.date);
        }
        return await this.productReturnRepository.save(productReturn);
    }
    async updateStatus(id, updateStatusDto) {
        const productReturn = await this.findOne(id);
        productReturn.status = updateStatusDto.status;
        if (updateStatusDto.notes) {
            productReturn.notes = updateStatusDto.notes;
        }
        return await this.productReturnRepository.save(productReturn);
    }
    async remove(id) {
        const productReturn = await this.findOne(id);
        await this.productReturnRepository.remove(productReturn);
    }
    async getReturnStats() {
        const [total, pending, approved, rejected, processed] = await Promise.all([
            this.productReturnRepository.count(),
            this.productReturnRepository.count({ where: { status: 'pending' } }),
            this.productReturnRepository.count({ where: { status: 'approved' } }),
            this.productReturnRepository.count({ where: { status: 'rejected' } }),
            this.productReturnRepository.count({ where: { status: 'processed' } }),
        ]);
        return { total, pending, approved, rejected, processed };
    }
    async getReturnsByProduct(productId) {
        return await this.productReturnRepository.find({
            where: { productId },
            relations: ['salesrep', 'product', 'client'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.ProductReturnsService = ProductReturnsService;
exports.ProductReturnsService = ProductReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_return_entity_1.ProductReturn)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductReturnsService);
//# sourceMappingURL=product-returns.service.js.map