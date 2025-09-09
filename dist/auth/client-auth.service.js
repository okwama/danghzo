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
var ClientAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientAuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const clients_entity_1 = require("../entities/clients.entity");
let ClientAuthService = ClientAuthService_1 = class ClientAuthService {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
        this.logger = new common_1.Logger(ClientAuthService_1.name);
    }
    async validateClient(identifier, password) {
        this.logger.log(`🔍 Validating client with identifier: ${identifier}`);
        const client = await this.clientRepository.findOne({
            where: [
                { name: identifier, status: 1 },
                { email: identifier, status: 1 }
            ],
        });
        if (!client) {
            this.logger.warn(`❌ Client not found for identifier: ${identifier}`);
            return null;
        }
        this.logger.log(`👤 Client found: ${client.name} (ID: ${client.id}, Status: ${client.status})`);
        if (client.status !== 1) {
            this.logger.warn(`❌ Client ${client.name} is inactive (status: ${client.status})`);
            throw new common_1.UnauthorizedException('Your account is inactive. Please contact support.');
        }
        const isValidPassword = await client.validatePassword(password);
        this.logger.log(`🔐 Password validation for ${client.name}: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);
        if (isValidPassword) {
            this.logger.log(`✅ Client ${client.name} validated successfully`);
            return client;
        }
        this.logger.warn(`❌ Invalid password for client: ${client.name}`);
        return null;
    }
    async findById(id) {
        return this.clientRepository.findOne({
            where: { id, status: 1 },
        });
    }
    async findByEmail(email) {
        return this.clientRepository.findOne({
            where: { email, status: 1 },
        });
    }
    async findByName(name) {
        return this.clientRepository.findOne({
            where: { name, status: 1 },
        });
    }
};
exports.ClientAuthService = ClientAuthService;
exports.ClientAuthService = ClientAuthService = ClientAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(clients_entity_1.Clients)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClientAuthService);
//# sourceMappingURL=client-auth.service.js.map