import { ClockInOutService } from './clock-in-out.service';
import { ClockOutSchedulerService } from './clock-out-scheduler.service';
import { ClockInDto, ClockOutDto } from './dto';
export declare class ClockInOutController {
    private readonly clockInOutService;
    private readonly clockOutSchedulerService;
    constructor(clockInOutService: ClockInOutService, clockOutSchedulerService: ClockOutSchedulerService);
    clockIn(clockInDto: ClockInDto): Promise<{
        success: boolean;
        message: string;
        sessionId?: number;
    }>;
    clockOut(clockOutDto: ClockOutDto): Promise<{
        success: boolean;
        message: string;
        duration?: number;
    }>;
    getCurrentStatus(userId: string): Promise<{
        isClockedIn: boolean;
        sessionStart?: string;
        sessionEnd?: string;
        duration?: number;
        sessionId?: number;
        status?: string;
        clockInTime?: string;
        clockOutTime?: string;
        createdAt?: string;
    }>;
    getTodaySessions(userId: string): Promise<{
        sessions: any[];
        statistics: any;
    }>;
    getUserSessions(userId: string, period?: 'today' | 'week' | 'month' | 'custom', startDate?: string, endDate?: string, limit?: string): Promise<{
        sessions: any[];
        statistics: any;
    }>;
    triggerAutoClockOut(): Promise<void>;
    getActiveSessionsCount(): Promise<{
        activeSessionsCount: number;
    }>;
    forceClockOut(userId: string): Promise<{
        success: boolean;
        message: string;
        closedSessions?: number;
    }>;
}
