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
var DatabaseHealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseHealthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let DatabaseHealthService = DatabaseHealthService_1 = class DatabaseHealthService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DatabaseHealthService_1.name);
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 15;
        this.reconnectDelay = 3000;
        this.isReconnecting = false;
        this.lastHealthCheck = Date.now();
        this.consecutiveFailures = 0;
        this.maxConsecutiveFailures = 5;
    }
    async onModuleInit() {
        this.startHealthCheck();
        this.logger.log('Database health monitoring started');
    }
    startHealthCheck() {
        this.healthCheckInterval = setInterval(async () => {
            await this.checkDatabaseHealth();
        }, 20000);
    }
    async checkDatabaseHealth() {
        if (this.isReconnecting) {
            this.logger.debug('Skipping health check - reconnection in progress');
            return;
        }
        try {
            const queryRunner = this.dataSource.createQueryRunner();
            try {
                await Promise.race([
                    queryRunner.query('SELECT 1 as health_check'),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), 10000))
                ]);
                this.consecutiveFailures = 0;
                this.reconnectAttempts = 0;
                this.lastHealthCheck = Date.now();
                this.logger.debug('Database connection is healthy');
            }
            finally {
                await queryRunner.release();
            }
        }
        catch (error) {
            this.consecutiveFailures++;
            this.logger.warn(`Database health check failed (${this.consecutiveFailures}/${this.maxConsecutiveFailures}): ${error.message}`);
            if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
                await this.handleConnectionError();
            }
        }
    }
    async handleConnectionError() {
        if (this.isReconnecting) {
            this.logger.debug('Reconnection already in progress, skipping');
            return;
        }
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.logger.error('Max reconnection attempts reached. Stopping health checks.');
            clearInterval(this.healthCheckInterval);
            return;
        }
        this.isReconnecting = true;
        this.reconnectAttempts++;
        this.logger.warn(`Attempting to reconnect to database (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        try {
            if (this.dataSource.isInitialized) {
                this.logger.debug('Closing existing database connections...');
                await this.dataSource.destroy();
            }
            await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
            await this.retryConnection();
            this.logger.log('Database reconnection successful');
            this.reconnectAttempts = 0;
            this.consecutiveFailures = 0;
        }
        catch (error) {
            this.logger.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error.message);
            const backoffDelay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) + Math.random() * 1000, 30000);
            this.logger.debug(`Waiting ${Math.round(backoffDelay)}ms before next reconnection attempt`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
        finally {
            this.isReconnecting = false;
        }
    }
    async retryConnection(maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.logger.debug(`Initializing database connection (attempt ${attempt}/${maxRetries})`);
                await this.dataSource.initialize();
                return;
            }
            catch (error) {
                this.logger.warn(`Connection initialization attempt ${attempt} failed: ${error.message}`);
                if (attempt === maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
    async isHealthy() {
        try {
            const queryRunner = this.dataSource.createQueryRunner();
            try {
                await Promise.race([
                    queryRunner.query('SELECT 1 as health_check'),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), 5000))
                ]);
                return true;
            }
            finally {
                await queryRunner.release();
            }
        }
        catch (error) {
            this.logger.error('Database health check failed:', error.message);
            return false;
        }
    }
    async getConnectionInfo() {
        return {
            isInitialized: this.dataSource.isInitialized,
            isConnected: this.dataSource.isInitialized,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts,
            consecutiveFailures: this.consecutiveFailures,
            lastHealthCheck: this.lastHealthCheck,
            isReconnecting: this.isReconnecting,
            timeSinceLastHealthCheck: Date.now() - this.lastHealthCheck,
        };
    }
    async forceReconnect() {
        this.logger.log('Force reconnection requested');
        this.consecutiveFailures = this.maxConsecutiveFailures;
        await this.handleConnectionError();
        return this.dataSource.isInitialized;
    }
    onModuleDestroy() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.logger.log('Database health monitoring stopped');
        }
    }
};
exports.DatabaseHealthService = DatabaseHealthService;
exports.DatabaseHealthService = DatabaseHealthService = DatabaseHealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], DatabaseHealthService);
//# sourceMappingURL=database-health.service.js.map