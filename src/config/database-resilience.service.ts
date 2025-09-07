import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository, EntityTarget } from 'typeorm';

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  timeout?: number;
}

@Injectable()
export class DatabaseResilienceService {
  private readonly logger = new Logger(DatabaseResilienceService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Execute a database operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoffMultiplier = 2,
      timeout = 30000,
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Add timeout to the operation
        const result = await Promise.race([
          operation(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Operation timeout')), timeout)
          ),
        ]);

        if (attempt > 1) {
          this.logger.log(`Operation succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Database operation failed (attempt ${attempt}/${maxAttempts}): ${error.message}`
        );

        // Check if it's a connection-related error
        if (this.isConnectionError(error)) {
          if (attempt < maxAttempts) {
            const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
            this.logger.debug(`Waiting ${waitTime}ms before retry...`);
            await this.sleep(waitTime);
            continue;
          }
        } else {
          // For non-connection errors, don't retry
          throw error;
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute a query with retry logic
   */
  async queryWithRetry<T = any>(
    query: string,
    parameters?: any[],
    options?: RetryOptions
  ): Promise<T[]> {
    return this.executeWithRetry(
      async () => {
        const queryRunner = this.dataSource.createQueryRunner();
        try {
          return await queryRunner.query(query, parameters);
        } finally {
          await queryRunner.release();
        }
      },
      options
    );
  }

  /**
   * Get repository with retry logic
   */
  async getRepositoryWithRetry<T>(
    entity: EntityTarget<T>
  ): Promise<Repository<T>> {
    return this.executeWithRetry(
      async () => this.dataSource.getRepository(entity),
      { maxAttempts: 2, delay: 500 }
    );
  }

  /**
   * Execute transaction with retry logic
   */
  async executeTransactionWithRetry<T>(
    operation: (queryRunner: QueryRunner) => Promise<T>,
    options?: RetryOptions
  ): Promise<T> {
    return this.executeWithRetry(
      async () => {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          const result = await operation(queryRunner);
          await queryRunner.commitTransaction();
          return result;
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      },
      options
    );
  }

  /**
   * Check if error is connection-related
   */
  private isConnectionError(error: any): boolean {
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
    return connectionErrors.some(err => 
      errorMessage.includes(err) || errorMessage.includes(err.toLowerCase())
    );
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get database connection status
   */
  async getConnectionStatus(): Promise<{
    isInitialized: boolean;
    isConnected: boolean;
    driver: any;
  }> {
    return {
      isInitialized: this.dataSource.isInitialized,
      isConnected: this.dataSource.isInitialized,
      driver: this.dataSource.driver,
    };
  }

  /**
   * Test database connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.queryWithRetry('SELECT 1 as test', [], { maxAttempts: 1, timeout: 5000 });
      return true;
    } catch (error) {
      this.logger.error('Database connection test failed:', error.message);
      return false;
    }
  }
}
