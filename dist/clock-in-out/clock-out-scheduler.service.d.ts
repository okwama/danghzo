import { Repository } from 'typeorm';
import { LoginHistory } from '../entities/login-history.entity';
export declare class ClockOutSchedulerService {
    private loginHistoryRepository;
    private readonly logger;
    constructor(loginHistoryRepository: Repository<LoginHistory>);
    autoClockOutAllUsers(): Promise<void>;
    manualTriggerClockOut(): Promise<void>;
    executeVercelCronJob(): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
        affectedSessions?: number;
        error?: string;
    }>;
    getActiveSessionsCount(): Promise<number>;
}
