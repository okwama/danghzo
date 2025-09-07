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
var DatabaseResilienceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseResilienceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let DatabaseResilienceService = DatabaseResilienceService_1 = class DatabaseResilienceService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DatabaseResilienceService_1.name);
    }
    async executeWithRetry(operation, options = {}) {
        const { maxAttempts = 3, delay = 1000, backoffMultiplier = 2, timeout = 30000, } = options;
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const result = await Promise.race([
                    operation(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timeout')), timeout)),
                ]);
                if (attempt > 1) {
                    this.logger.log(`Operation succeeded on attempt ${attempt}`);
                }
                return result;
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`Database operation failed (attempt ${attempt}/${maxAttempts}): ${error.message}`);
                if (this.isConnectionError(error)) {
                    if (attempt < maxAttempts) {
                        const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
                        this.logger.debug(`Waiting ${waitTime}ms before retry...`);
                        await this.sleep(waitTime);
                        continue;
                    }
                }
                else {
                    throw error;
                }
            }
        }
        throw lastError;
    }
    async queryWithRetry(query, parameters, options) {
        return this.executeWithRetry(async () => {
            const queryRunner = this.dataSource.createQueryRunner();
            try {
                return await queryRunner.query(query, parameters);
            }
            finally {
                await queryRunner.release();
            }
        }, options);
    }
    async getRepositoryWithRetry(entity) {
        return this.executeWithRetry(async () => this.dataSource.getRepository(entity), { maxAttempts: 2, delay: 500 });
    }
    async executeTransactionWithRetry(operation, options) {
        return this.executeWithRetry(async () => {
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const result = await operation(queryRunner);
                await queryRunner.commitTransaction();
                return result;
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            }
            finally {
                await queryRunner.release();
            }
        }, options);
    }
    isConnectionError(error) {
        const connectionErrors = [
            'ETIMEDOUT',
            'ECONNRESET',
            'ECONNREFUSED',
            'ENOTFOUND',
            'read ETIMEDOUT',
            'write ETIMEDOUT',
            'Connection lost',
            'Connection timeout',
            'MySQL server has gone away',
            'Lost connection to MySQL server',
            'Connection is not available',
        ];
        const errorMessage = error.message || error.code || '';
        return connectionErrors.some(err => errorMessage.includes(err) || errorMessage.includes(err.toLowerCase()));
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async getConnectionStatus() {
        return {
            isInitialized: this.dataSource.isInitialized,
            isConnected: this.dataSource.isInitialized,
            driver: this.dataSource.driver,
        };
    }
    async testConnection() {
        try {
            await this.queryWithRetry('SELECT 1 as test', [], { maxAttempts: 1, timeout: 5000 });
            return true;
        }
        catch (error) {
            this.logger.error('Database connection test failed:', error.message);
            return false;
        }
    }
};
exports.DatabaseResilienceService = DatabaseResilienceService;
exports.DatabaseResilienceService = DatabaseResilienceService = DatabaseResilienceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], DatabaseResilienceService);
//# sourceMappingURL=database-resilience.service.js.map