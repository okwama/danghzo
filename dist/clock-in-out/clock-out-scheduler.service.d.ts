import { Repository } from 'typeorm';
import { LoginHistory } from '../entities/login-history.entity';
export declare class ClockOutSchedulerService {
    private loginHistoryRepository;
    private readonly logger;
    constructor(loginHistoryRepository: Repository<LoginHistory>);
    autoClockOutAllUsers(): Promise<void>;
    manualTriggerClockOut(): Promise<void>;
    getActiveSessionsCount(): Promise<number>;
    executeVercelCronJob(): Promise<{
        success: boolean;
        message: string;
        activeSessionsRemaining: number;
        timestamp: string;
        timezone: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        timestamp: string;
        timezone: string;
        activeSessionsRemaining?: undefined;
    }>;
}
