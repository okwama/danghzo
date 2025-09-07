import { DataSource, QueryRunner, Repository, EntityTarget } from 'typeorm';
export interface RetryOptions {
    maxAttempts?: number;
    delay?: number;
    backoffMultiplier?: number;
    timeout?: number;
}
export declare class DatabaseResilienceService {
    private dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    executeWithRetry<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T>;
    queryWithRetry<T = any>(query: string, parameters?: any[], options?: RetryOptions): Promise<T[]>;
    getRepositoryWithRetry<T>(entity: EntityTarget<T>): Promise<Repository<T>>;
    executeTransactionWithRetry<T>(operation: (queryRunner: QueryRunner) => Promise<T>, options?: RetryOptions): Promise<T>;
    private isConnectionError;
    private sleep;
    getConnectionStatus(): Promise<{
        isInitialized: boolean;
        isConnected: boolean;
        driver: any;
    }>;
    testConnection(): Promise<boolean>;
}
