import { Controller, Get, Post, UseGuards, Logger } from '@nestjs/common';
import { DatabaseHealthService } from './database-health.service';
import { DatabaseResilienceService } from './database-resilience.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('database')
@UseGuards(JwtAuthGuard)
export class DatabaseMonitorController {
  private readonly logger = new Logger(DatabaseMonitorController.name);

  constructor(
    private readonly databaseHealthService: DatabaseHealthService,
    private readonly databaseResilienceService: DatabaseResilienceService,
  ) {}

  @Get('health')
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
    } catch (error) {
      this.logger.error('Error getting database health status:', error);
      return {
        success: false,
        error: 'Failed to get database health status',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('status')
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
    } catch (error) {
      this.logger.error('Error getting connection status:', error);
      return {
        success: false,
        error: 'Failed to get connection status',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('reconnect')
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
    } catch (error) {
      this.logger.error('Error during force reconnection:', error);
      return {
        success: false,
        error: 'Failed to force reconnection',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('test')
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
    } catch (error) {
      this.logger.error('Error testing database connection:', error);
      return {
        success: false,
        error: 'Failed to test database connection',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
