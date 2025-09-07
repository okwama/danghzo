import { DatabaseHealthService } from './database-health.service';
import { DatabaseResilienceService } from './database-resilience.service';
export declare class DatabaseMonitorController {
    private readonly databaseHealthService;
    private readonly databaseResilienceService;
    private readonly logger;
    constructor(databaseHealthService: DatabaseHealthService, databaseResilienceService: DatabaseResilienceService);
    getHealthStatus(): Promise<{
        success: boolean;
        data: {
            isHealthy: boolean;
            connectionInfo: {
                isInitialized: boolean;
                isConnected: boolean;
                reconnectAttempts: number;
                maxReconnectAttempts: number;
                consecutiveFailures: number;
                lastHealthCheck: number;
                isReconnecting: boolean;
                timeSinceLastHealthCheck: number;
            };
            connectionStatus: {
                isInitialized: boolean;
                isConnected: boolean;
                driver: any;
            };
            connectivityTest: boolean;
            timestamp: string;
        };
        error?: undefined;
        timestamp?: undefined;
    } | {
        success: boolean;
        error: string;
        timestamp: string;
        data?: undefined;
    }>;
    getConnectionStatus(): Promise<{
        success: boolean;
        data: {
            connectionInfo: {
                isInitialized: boolean;
                isConnected: boolean;
                reconnectAttempts: number;
                maxReconnectAttempts: number;
                consecutiveFailures: number;
                lastHealthCheck: number;
                isReconnecting: boolean;
                timeSinceLastHealthCheck: number;
            };
            connectionStatus: {
                isInitialized: boolean;
                isConnected: boolean;
                driver: any;
            };
            timestamp: string;
        };
        error?: undefined;
        timestamp?: undefined;
    } | {
        success: boolean;
        error: string;
        timestamp: string;
        data?: undefined;
    }>;
    forceReconnect(): Promise<{
        success: boolean;
        data: {
            reconnectionSuccessful: boolean;
            message: string;
            timestamp: string;
        };
        error?: undefined;
        timestamp?: undefined;
    } | {
        success: boolean;
        error: string;
        timestamp: string;
        data?: undefined;
    }>;
    testConnection(): Promise<{
        success: boolean;
        data: {
            healthCheck: boolean;
            connectivityTest: boolean;
            timestamp: string;
        };
        error?: undefined;
        timestamp?: undefined;
    } | {
        success: boolean;
        error: string;
        timestamp: string;
        data?: undefined;
    }>;
}
