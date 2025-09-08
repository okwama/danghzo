"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ClockInOutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClockInOutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const login_history_entity_1 = require("../entities/login-history.entity");
let ClockInOutService = ClockInOutService_1 = class ClockInOutService {
    constructor(loginHistoryRepository, dataSource) {
        this.loginHistoryRepository = loginHistoryRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ClockInOutService_1.name);
    }
    async clockIn(clockInDto) {
        try {
            const { userId, clientTime } = clockInDto;
            this.logger.log(`🟢 Clock In attempt for user ${userId} at ${clientTime}`);
            const now = new Date();
            const nairobiTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
            const todayStr = nairobiTime.toISOString().slice(0, 10);
            this.logger.log(`📅 Clock-in checking for today's session: ${todayStr} (Nairobi time)`);
            const activeSession = await this.loginHistoryRepository
                .createQueryBuilder('session')
                .where('session.userId = :userId', { userId })
                .andWhere('session.status = :status', { status: 1 })
                .andWhere('DATE(session.sessionStart) = :today', { today: todayStr })
                .orderBy('session.sessionStart', 'DESC')
                .getOne();
            if (activeSession) {
                this.logger.log(`✅ User ${userId} has active session, continuing existing session`);
                return {
                    success: true,
                    message: 'Continuing existing session',
                    sessionId: activeSession.id,
                };
            }
            const todaySession = await this.loginHistoryRepository
                .createQueryBuilder('session')
                .where('session.userId = :userId', { userId })
                .andWhere('DATE(session.sessionStart) = :today', { today: todayStr })
                .andWhere('session.status = 2')
                .orderBy('session.sessionStart', 'DESC')
                .getOne();
            if (todaySession) {
                await this.loginHistoryRepository.update(todaySession.id, {
                    status: 1,
                    sessionEnd: null,
                    duration: 0,
                });
                this.logger.log(`✅ User ${userId} continuing today's session. Session ID: ${todaySession.id}`);
                return {
                    success: true,
                    message: 'Continuing today\'s session',
                    sessionId: todaySession.id,
                };
            }
            const formattedTime = new Date(clientTime).toISOString().slice(0, 19).replace('T', ' ');
            const newSession = this.loginHistoryRepository.create({
                userId,
                status: 1,
                sessionStart: formattedTime,
                timezone: 'Africa/Nairobi',
                duration: 0,
            });
            const savedSession = await this.loginHistoryRepository.save(newSession);
            this.logger.log(`✅ User ${userId} clocked in successfully. Session ID: ${savedSession.id}`);
            return {
                success: true,
                message: 'Successfully clocked in',
                sessionId: savedSession.id,
            };
        }
        catch (error) {
            this.logger.error(`❌ Clock In failed for user ${clockInDto.userId}: ${error.message}`);
            return {
                success: false,
                message: 'Failed to clock in. Please try again.',
            };
        }
    }
    async clockOut(clockOutDto) {
        try {
            const { userId, clientTime } = clockOutDto;
            this.logger.log(`🔴 Clock Out attempt for user ${userId} at ${clientTime}`);
            const today = new Date();
            const todayStr = today.toISOString().slice(0, 10);
            const activeSession = await this.loginHistoryRepository
                .createQueryBuilder('session')
                .where('session.userId = :userId', { userId })
                .andWhere('session.status = :status', { status: 1 })
                .andWhere('DATE(session.sessionStart) = :today', { today: todayStr })
                .orderBy('session.sessionStart', 'DESC')
                .getOne();
            if (!activeSession) {
                this.logger.warn(`⚠️ User ${userId} has no active session to clock out`);
                return {
                    success: false,
                    message: 'You are not currently clocked in.',
                };
            }
            const startTime = new Date(activeSession.sessionStart);
            const endTime = new Date(clientTime);
            const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
            const validatedDuration = Math.min(durationMinutes, 480);
            let finalEndTime = new Date(clientTime).toISOString().slice(0, 19).replace('T', ' ');
            if (durationMinutes > 480) {
                const cappedEndTime = new Date(startTime);
                cappedEndTime.setHours(18, 0, 0, 0);
                finalEndTime = cappedEndTime.toISOString().slice(0, 19).replace('T', ' ');
                this.logger.warn(`⚠️ Session duration exceeded 8 hours, capping end time to 6:00 PM for user ${userId}`);
            }
            await this.loginHistoryRepository.update(activeSession.id, {
                status: 2,
                sessionEnd: finalEndTime,
                duration: validatedDuration,
            });
            this.logger.log(`✅ User ${userId} clocked out successfully. Duration: ${validatedDuration} minutes`);
            return {
                success: true,
                message: 'Successfully clocked out',
                duration: validatedDuration,
            };
        }
        catch (error) {
            this.logger.error(`❌ Clock Out failed for user ${clockOutDto.userId}: ${error.message}`);
            return {
                success: false,
                message: 'Failed to clock out. Please try again.',
            };
        }
    }
    async getCurrentStatus(userId) {
        try {
            const now = new Date();
            const nairobiTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
            const todayStr = nairobiTime.toISOString().slice(0, 10);
            this.logger.log(`📅 Checking for today's session: ${todayStr} (Nairobi time)`);
            const activeSession = await this.loginHistoryRepository
                .createQueryBuilder('session')
                .where('session.userId = :userId', { userId })
                .andWhere('session.status = :status', { status: 1 })
                .andWhere('DATE(session.sessionStart) = :today', { today: todayStr })
                .orderBy('session.sessionStart', 'DESC')
                .getOne();
            if (!activeSession) {
                this.logger.log(`📊 User ${userId} has no active session for today (${todayStr})`);
                return { isClockedIn: false };
            }
            const startTime = new Date(activeSession.sessionStart);
            const currentTime = new Date();
            const currentDuration = Math.floor((currentTime.getTime() - startTime.getTime()) / (1000 * 60));
            this.logger.log(`📊 User ${userId} has active session for today: ${activeSession.sessionStart}, duration: ${currentDuration} minutes`);
            return {
                isClockedIn: true,
                sessionStart: activeSession.sessionStart,
                sessionEnd: activeSession.sessionEnd,
                duration: currentDuration,
                sessionId: activeSession.id,
                status: activeSession.status === 1 ? 'active' : 'completed',
                clockInTime: activeSession.sessionStart,
                clockOutTime: activeSession.sessionEnd,
                createdAt: activeSession.sessionStart,
            };
        }
        catch (error) {
            this.logger.error(`❌ Get current status failed for user ${userId}: ${error.message}`);
            return { isClockedIn: false };
        }
    }
    async getUserSessions(userId, period, startDate, endDate, limit = 50) {
        try {
            this.logger.log(`📊 Getting user sessions for user ${userId}, period: ${period}`);
            const { start, end } = this.calculateDateRange(period, startDate, endDate);
            this.logger.log(`📅 Date range: ${start} to ${end}`);
            this.logger.log(`🔍 SQL Query: SELECT * FROM LoginHistory WHERE userId = ${userId} AND DATE(sessionStart) BETWEEN '${start}' AND '${end}' ORDER BY sessionStart DESC LIMIT ${limit}`);
            const sessions = await this.loginHistoryRepository
                .createQueryBuilder('session')
                .where('session.userId = :userId', { userId })
                .andWhere('DATE(session.sessionStart) >= :start', { start })
                .andWhere('DATE(session.sessionStart) <= :end', { end })
                .orderBy('session.sessionStart', 'DESC')
                .limit(limit)
                .getMany();
            this.logger.log(`🔍 Raw sessions found: ${sessions.length}`);
            if (sessions.length > 0) {
                this.logger.log(`🔍 First session: ${JSON.stringify(sessions[0])}`);
                this.logger.log(`🔍 Date range used: ${start} to ${end}`);
            }
            else {
                this.logger.log(`🔍 No sessions found for user ${userId} in date range ${start} to ${end}`);
            }
            const statistics = await this.calculateStatistics(sessions, period, start, end, userId);
            const formattedSessions = sessions.map(session => ({
                id: session.id,
                userId: session.userId,
                sessionStart: session.sessionStart,
                sessionEnd: session.sessionEnd,
                duration: session.duration,
                status: session.status,
                timezone: session.timezone,
                formattedStart: this.formatDateTime(session.sessionStart),
                formattedEnd: session.sessionEnd ? this.formatDateTime(session.sessionEnd) : null,
                formattedDuration: session.duration ? this.formatDuration(session.duration) : null,
                isActive: session.status === 1,
                statusText: session.status === 1 ? 'Active' : 'Completed',
            }));
            this.logger.log(`✅ Found ${formattedSessions.length} sessions for user ${userId}`);
            return { sessions: formattedSessions, statistics };
        }
        catch (error) {
            this.logger.error(`❌ Get user sessions failed for user ${userId}: ${error.message}`);
            return { sessions: [], statistics: this.getEmptyStatistics() };
        }
    }
    calculateDateRange(period, startDate, endDate) {
        const now = new Date();
        switch (period) {
            case 'today':
                const today = now.toISOString().split('T')[0];
                return { start: today, end: today };
            case 'week':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay() + 1);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                return {
                    start: startOfWeek.toISOString().split('T')[0],
                    end: endOfWeek.toISOString().split('T')[0]
                };
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                return {
                    start: startOfMonth.toISOString().split('T')[0],
                    end: endOfMonth.toISOString().split('T')[0]
                };
            case 'custom':
                if (!startDate || !endDate) {
                    this.logger.warn('Custom period requires both startDate and endDate');
                    const today = now.toISOString().split('T')[0];
                    return { start: today, end: today };
                }
                const start = new Date(startDate);
                const end = new Date(endDate);
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    this.logger.warn('Invalid date format provided');
                    const today = now.toISOString().split('T')[0];
                    return { start: today, end: today };
                }
                if (start > end) {
                    this.logger.warn('startDate is after endDate, swapping dates');
                    return { start: endDate, end: startDate };
                }
                return { start: startDate, end: endDate };
            default:
                const thirtyDaysAgo = new Date(now);
                thirtyDaysAgo.setDate(now.getDate() - 30);
                return {
                    start: thirtyDaysAgo.toISOString().split('T')[0],
                    end: now.toISOString().split('T')[0]
                };
        }
    }
    async calculateStatistics(sessions, period, startDate, endDate, userId) {
        const totalSessions = sessions.length;
        const activeSessions = sessions.filter(s => s.status === 1).length;
        const completedSessions = sessions.filter(s => s.status === 2).length;
        const totalDuration = sessions
            .filter(s => s.duration !== null)
            .reduce((sum, session) => sum + session.duration, 0);
        const totalHours = Math.round((totalDuration / 60) * 100) / 100;
        const averageDuration = completedSessions > 0 ? Math.round(totalDuration / completedSessions) : 0;
        const averageHours = Math.round((averageDuration / 60) * 100) / 100;
        const monthlyAttendance = await this.calculateMonthlyAttendance(userId);
        return {
            totalSessions,
            activeSessions,
            completedSessions,
            totalDuration,
            totalHours,
            averageDuration,
            averageHours,
            workedDays: monthlyAttendance.workedDays,
            totalWorkingDays: monthlyAttendance.totalWorkingDays,
            attendanceRatio: `${monthlyAttendance.workedDays}/${monthlyAttendance.totalWorkingDays}`,
        };
    }
    async calculateMonthlyAttendance(userId) {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const startStr = startOfMonth.toISOString().split('T')[0];
            const endStr = endOfMonth.toISOString().split('T')[0];
            const monthlySessions = await this.loginHistoryRepository
                .createQueryBuilder('session')
                .where('session.userId = :userId', { userId })
                .andWhere('DATE(session.sessionStart) >= :start', { start: startStr })
                .andWhere('DATE(session.sessionStart) <= :end', { end: endStr })
                .getMany();
            const workedDaysSet = new Set();
            monthlySessions.forEach(session => {
                const sessionDate = new Date(session.sessionStart);
                const dayOfWeek = sessionDate.getDay();
                if (dayOfWeek !== 0) {
                    const dateStr = sessionDate.toISOString().split('T')[0];
                    workedDaysSet.add(dateStr);
                }
            });
            const workedDays = workedDaysSet.size;
            let totalWorkingDays = 0;
            const currentDate = new Date(startOfMonth);
            while (currentDate <= endOfMonth) {
                const dayOfWeek = currentDate.getDay();
                if (dayOfWeek !== 0) {
                    totalWorkingDays++;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            this.logger.log(`📊 Monthly attendance: ${workedDays} worked days out of ${totalWorkingDays} total working days in ${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`);
            this.logger.log(`📊 Monthly sessions found: ${monthlySessions.length} sessions from ${startStr} to ${endStr}`);
            return { workedDays, totalWorkingDays };
        }
        catch (error) {
            this.logger.error(`❌ Failed to calculate monthly attendance: ${error.message}`);
            return { workedDays: 0, totalWorkingDays: 0 };
        }
    }
    calculateAttendanceDays(sessions, period, startDate, endDate) {
        try {
            const workedDaysSet = new Set();
            sessions.forEach(session => {
                const sessionDate = new Date(session.sessionStart);
                const dayOfWeek = sessionDate.getDay();
                if (dayOfWeek !== 0) {
                    const dateStr = sessionDate.toISOString().split('T')[0];
                    workedDaysSet.add(dateStr);
                }
            });
            const workedDays = workedDaysSet.size;
            const start = new Date(startDate);
            const end = new Date(endDate);
            let totalWorkingDays = 0;
            const currentDate = new Date(start);
            while (currentDate <= end) {
                const dayOfWeek = currentDate.getDay();
                if (dayOfWeek !== 0) {
                    totalWorkingDays++;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            this.logger.log(`📊 Attendance calculation: ${workedDays} worked days out of ${totalWorkingDays} total working days`);
            return { workedDays, totalWorkingDays };
        }
        catch (error) {
            this.logger.error(`❌ Failed to calculate attendance days: ${error.message}`);
            return { workedDays: 0, totalWorkingDays: 0 };
        }
    }
    getEmptyStatistics() {
        return {
            totalSessions: 0,
            activeSessions: 0,
            completedSessions: 0,
            totalDuration: 0,
            totalHours: 0,
            averageDuration: 0,
            averageHours: 0,
            workedDays: 0,
            totalWorkingDays: 0,
            attendanceRatio: '0/0',
        };
    }
    formatDateTime(dateTimeStr) {
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        }
        catch (e) {
            return dateTimeStr;
        }
    }
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${remainingMinutes}m`;
        }
        else {
            return `${remainingMinutes}m`;
        }
    }
    async forceClockOut(userId) {
        try {
            this.logger.log(`🔧 Force clock out requested for user ${userId}`);
            const activeSessions = await this.loginHistoryRepository.find({
                where: {
                    userId,
                    status: 1,
                },
                order: { sessionStart: 'DESC' },
            });
            if (activeSessions.length === 0) {
                return {
                    success: false,
                    message: 'User has no active sessions to close.',
                };
            }
            let closedCount = 0;
            for (const session of activeSessions) {
                const startTime = new Date(session.sessionStart);
                const endTime = new Date(startTime);
                endTime.setHours(18, 0, 0, 0);
                const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
                await this.loginHistoryRepository.update(session.id, {
                    status: 2,
                    sessionEnd: endTime.toISOString().slice(0, 19).replace('T', ' '),
                    duration: durationMinutes,
                });
                closedCount++;
                this.logger.log(`✅ Force closed session ${session.id} for user ${userId}`);
            }
            this.logger.log(`✅ Force clock out completed for user ${userId}. Closed ${closedCount} sessions.`);
            return {
                success: true,
                message: `Successfully closed ${closedCount} active session(s)`,
                closedSessions: closedCount,
            };
        }
        catch (error) {
            this.logger.error(`❌ Force clock out failed for user ${userId}: ${error.message}`);
            return {
                success: false,
                message: 'Failed to force clock out. Please try again.',
            };
        }
    }
};
exports.ClockInOutService = ClockInOutService;
exports.ClockInOutService = ClockInOutService = ClockInOutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(login_history_entity_1.LoginHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], ClockInOutService);
//# sourceMappingURL=clock-in-out.service.js.map