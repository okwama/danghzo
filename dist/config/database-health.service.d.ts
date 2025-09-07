import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class DatabaseHealthService implements OnModuleInit, OnModuleDestroy {
    private dataSource;
    private readonly logger;
    private healthCheckInterval;
    private reconnectAttempts;
    private readonly maxReconnectAttempts;
    private readonly reconnectDelay;
    private isReconnecting;
    private lastHealthCheck;
    private consecutiveFailures;
    private readonly maxConsecutiveFailures;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
    private startHealthCheck;
    private checkDatabaseHealth;
    private handleConnectionError;
    private retryConnection;
    isHealthy(): Promise<boolean>;
    getConnectionInfo(): Promise<{
        isInitialized: boolean;
        isConnected: boolean;
        reconnectAttempts: number;
        maxReconnectAttempts: number;
        consecutiveFailures: number;
        lastHealthCheck: number;
        isReconnecting: boolean;
        timeSinceLastHealthCheck: number;
    }>;
    forceReconnect(): Promise<boolean>;
    onModuleDestroy(): void;
}
