import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class DatabaseHealthService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseHealthService.name);
  private healthCheckInterval: NodeJS.Timeout;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 15; // Increased max attempts
  private readonly reconnectDelay = 3000; // Reduced initial delay
  private isReconnecting = false;
  private lastHealthCheck = Date.now();
  private consecutiveFailures = 0;
  private readonly maxConsecutiveFailures = 5;

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.startHealthCheck();
    this.logger.log('Database health monitoring started');
  }

  private startHealthCheck() {
    // Check database health every 20 seconds (reduced from 30)
    this.healthCheckInterval = setInterval(async () => {
      await this.checkDatabaseHealth();
    }, 20000);
  }

  private async checkDatabaseHealth() {
    if (this.isReconnecting) {
      this.logger.debug('Skipping health check - reconnection in progress');
      return;
    }

    try {
      // Use a dedicated query runner for health checks
      const queryRunner = this.dataSource.createQueryRunner();
      
      try {
        // Simple query to test connection with timeout
        await Promise.race([
          queryRunner.query('SELECT 1 as health_check'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), 10000)
          )
        ]);
        
        this.consecutiveFailures = 0;
        this.reconnectAttempts = 0;
        this.lastHealthCheck = Date.now();
        this.logger.debug('Database connection is healthy');
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.consecutiveFailures++;
      this.logger.warn(`Database health check failed (${this.consecutiveFailures}/${this.maxConsecutiveFailures}): ${error.message}`);
      
      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        await this.handleConnectionError();
      }
    }
  }

  private async handleConnectionError() {
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
      // Close existing connections gracefully
      if (this.dataSource.isInitialized) {
        this.logger.debug('Closing existing database connections...');
        await this.dataSource.destroy();
      }

      // Wait before reconnecting
      await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));

      // Reinitialize connection with retry logic
      await this.retryConnection();
      
      this.logger.log('Database reconnection successful');
      this.reconnectAttempts = 0;
      this.consecutiveFailures = 0;
    } catch (error) {
      this.logger.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error.message);
      
      // Exponential backoff with jitter
      const backoffDelay = Math.min(
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) + Math.random() * 1000,
        30000 // Max 30 seconds
      );
      
      this.logger.debug(`Waiting ${Math.round(backoffDelay)}ms before next reconnection attempt`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    } finally {
      this.isReconnecting = false;
    }
  }

  private async retryConnection(maxRetries = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`Initializing database connection (attempt ${attempt}/${maxRetries})`);
        await this.dataSource.initialize();
        return;
      } catch (error) {
        this.logger.warn(`Connection initialization attempt ${attempt} failed: ${error.message}`);
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      
      try {
        await Promise.race([
          queryRunner.query('SELECT 1 as health_check'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), 5000)
          )
        ]);
        return true;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
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

  async forceReconnect(): Promise<boolean> {
    this.logger.log('Force reconnection requested');
    this.consecutiveFailures = this.maxConsecutiveFailures; // Trigger reconnection
    await this.handleConnectionError();
    return this.dataSource.isInitialized;
  }

  onModuleDestroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.logger.log('Database health monitoring stopped');
    }
  }
} 