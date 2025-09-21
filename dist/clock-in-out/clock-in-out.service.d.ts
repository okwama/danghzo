import { Repository, DataSource } from 'typeorm';
import { LoginHistory } from '../entities/login-history.entity';
import { ClockInDto, ClockOutDto } from './dto';
export declare class ClockInOutService {
    private loginHistoryRepository;
    private dataSource;
    private readonly logger;
    constructor(loginHistoryRepository: Repository<LoginHistory>, dataSource: DataSource);
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
    getCurrentStatus(userId: number): Promise<{
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
    getUserSessions(userId: number, period: 'today' | 'week' | 'month' | 'custom', startDate?: string, endDate?: string, limit?: number): Promise<{
        sessions: any[];
        statistics: any;
    }>;
    private calculateDateRange;
    private calculateStatistics;
    private calculateMonthlyAttendance;
    private calculateAttendanceDays;
    private getEmptyStatistics;
    private formatDateTime;
    private formatDuration;
    private parseNairobiTime;
    forceClockOut(userId: number): Promise<{
        success: boolean;
        message: string;
        closedSessions?: number;
    }>;
}
