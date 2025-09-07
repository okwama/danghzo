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
var DatabaseMonitorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseMonitorController = void 0;
const common_1 = require("@nestjs/common");
const database_health_service_1 = require("./database-health.service");
const database_resilience_service_1 = require("./database-resilience.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let DatabaseMonitorController = DatabaseMonitorController_1 = class DatabaseMonitorController {
    constructor(databaseHealthService, databaseResilienceService) {
        this.databaseHealthService = databaseHealthService;
        this.databaseResilienceService = databaseResilienceService;
        this.logger = new common_1.Logger(DatabaseMonitorController_1.name);
    }
    async getHealthStatus() {
        try {
            const isHealthy = await this.databaseHealthService.isHealthy();
            const connectionInfo = await this.databaseHealthService.getConnectionInfo();
            const connectionStatus = await this.databaseResilienceService.getConnectionStatus();
            const connectivityTest = await this.databaseResilienceService.testConnection();
            return {
                success: true,
                data: {
                    isHealthy,
                    connectionInfo,
                    connectionStatus,
                    connectivityTest,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.logger.error('Error getting database health status:', error);
            return {
                success: false,
                error: 'Failed to get database health status',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getConnectionStatus() {
        try {
            const connectionInfo = await this.databaseHealthService.getConnectionInfo();
            const connectionStatus = await this.databaseResilienceService.getConnectionStatus();
            return {
                success: true,
                data: {
                    connectionInfo,
                    connectionStatus,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.logger.error('Error getting connection status:', error);
            return {
                success: false,
                error: 'Failed to get connection status',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async forceReconnect() {
        try {
            this.logger.log('Force reconnection requested via API');
            const success = await this.databaseHealthService.forceReconnect();
            return {
                success: true,
                data: {
                    reconnectionSuccessful: success,
                    message: success ? 'Database reconnection successful' : 'Database reconnection failed',
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.logger.error('Error during force reconnection:', error);
            return {
                success: false,
                error: 'Failed to force reconnection',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async testConnection() {
        try {
            const isHealthy = await this.databaseHealthService.isHealthy();
            const connectivityTest = await this.databaseResilienceService.testConnection();
            return {
                success: true,
                data: {
                    healthCheck: isHealthy,
                    connectivityTest,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.logger.error('Error testing database connection:', error);
            return {
                success: false,
                error: 'Failed to test database connection',
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.DatabaseMonitorController = DatabaseMonitorController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatabaseMonitorController.prototype, "getHealthStatus", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatabaseMonitorController.prototype, "getConnectionStatus", null);
__decorate([
    (0, common_1.Post)('reconnect'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatabaseMonitorController.prototype, "forceReconnect", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatabaseMonitorController.prototype, "testConnection", null);
exports.DatabaseMonitorController = DatabaseMonitorController = DatabaseMonitorController_1 = __decorate([
    (0, common_1.Controller)('database'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [database_health_service_1.DatabaseHealthService,
        database_resilience_service_1.DatabaseResilienceService])
], DatabaseMonitorController);
//# sourceMappingURL=database-monitor.controller.js.map