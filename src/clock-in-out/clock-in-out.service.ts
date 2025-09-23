import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LoginHistory } from '../entities/login-history.entity';
import { ClockInDto, ClockOutDto } from './dto';

@Injectable()
export class ClockInOutService {
  private readonly logger = new Logger(ClockInOutService.name);

  constructor(
    @InjectRepository(LoginHistory)
    private loginHistoryRepository: Repository<LoginHistory>,
    private dataSource: DataSource,
  ) {}

  /**
   * Clock In - Start a new session or continue existing session
   */
  async clockIn(clockInDto: ClockInDto): Promise<{ success: boolean; message: string; sessionId?: number }> {
    try {
      const { userId, clientTime } = clockInDto;

      this.logger.log(`🟢 Clock In attempt for user ${userId} at ${clientTime}`);

      // Prefer DB stored procedure if enabled
      const useDbSp = (process.env.USE_DB_SP_CLOCK ?? 'true').toLowerCase() !== 'false';
      if (useDbSp) {
        try {
          const raw = await this.dataSource.manager.query('CALL sp_clock_in(?, ?)', [userId, clientTime]);
          const rows = Array.isArray(raw) ? (Array.isArray(raw[0]) ? raw[0] : raw) : [];
          const r = rows[0] || {};
          const ok = (r.result || '').toString().toLowerCase() === 'ok';
          return {
            success: ok,
            message: r.message || (ok ? 'Successfully clocked in' : 'Clock in failed'),
            sessionId: r.sessionId ? Number(r.sessionId) : undefined,
          };
        } catch (spErr) {
          this.logger.warn(`SP clock_in failed, falling back to TypeORM logic: ${spErr.message}`);
        }
      }

      // Check if user has an active session for TODAY (using Africa/Nairobi timezone)
      const now = new Date();
      // Convert to Africa/Nairobi timezone (UTC+3)
      const nairobiTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      const todayStr = nairobiTime.toISOString().slice(0, 10); // YYYY-MM-DD format
      
      this.logger.log(`📅 Clock-in checking for today's session: ${todayStr} (Nairobi time)`);

      // Safety: Auto-close any previous-day active sessions before proceeding
      try {
        const staleActiveSessions = await this.loginHistoryRepository
          .createQueryBuilder('session')
          .where('session.userId = :userId', { userId })
          .andWhere('session.status = :status', { status: 1 })
          .andWhere('DATE(session.sessionStart) < :today', { today: todayStr })
          .orderBy('session.sessionStart', 'ASC')
          .getMany();

        if (staleActiveSessions.length > 0) {
          this.logger.warn(`⚠️ Found ${staleActiveSessions.length} previous-day active session(s) for user ${userId}. Auto-closing.`);
          for (const session of staleActiveSessions) {
            const startTime = this.parseNairobiTime(session.sessionStart);
            const endTime = new Date(startTime);
            endTime.setHours(18, 0, 0, 0); // 6:00 PM of that day
            const durationMinutes = Math.max(0, Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60)));

            await this.loginHistoryRepository.update(session.id, {
              status: 2,
              sessionEnd: endTime.toISOString().slice(0, 19).replace('T', ' '),
              duration: durationMinutes,
            });
          }
          this.logger.log(`✅ Auto-closed previous-day active sessions for user ${userId}`);
        }
      } catch (cleanupError) {
        this.logger.error(`❌ Failed to cleanup previous-day sessions for user ${userId}: ${cleanupError.message}`);
        // Continue clock-in even if cleanup fails
      }
      
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

      // Check if user has a completed session today that can be continued
      const todaySession = await this.loginHistoryRepository
        .createQueryBuilder('session')
        .where('session.userId = :userId', { userId })
        .andWhere('DATE(session.sessionStart) = :today', { today: todayStr })
        .andWhere('session.status = 2') // Only completed sessions
        .orderBy('session.sessionStart', 'DESC')
        .getOne();
      
      if (todaySession) {
        // Continue today's session by making it active again
        await this.loginHistoryRepository.update(todaySession.id, {
          status: 1, // Make it active again
          sessionEnd: null, // Clear end time
          duration: 0, // Reset duration
        });

        this.logger.log(`✅ User ${userId} continuing today's session. Session ID: ${todaySession.id}`);

        return {
          success: true,
          message: 'Continuing today\'s session',
          sessionId: todaySession.id,
        };
      }

      // Create new session for today - store the time as-is since client already sends Nairobi time
      const newSession = this.loginHistoryRepository.create({
        userId,
        status: 1, // Active
        sessionStart: clientTime, // Store client time directly (already in Nairobi time)
        timezone: 'Africa/Nairobi',
        duration: 0, // Will be calculated on clock out
      });

      const savedSession = await this.loginHistoryRepository.save(newSession);

      this.logger.log(`✅ User ${userId} clocked in successfully. Session ID: ${savedSession.id}`);

      return {
        success: true,
        message: 'Successfully clocked in',
        sessionId: savedSession.id,
      };
    } catch (error) {
      this.logger.error(`❌ Clock In failed for user ${clockInDto.userId}: ${error.message}`);
      return {
        success: false,
        message: 'Failed to clock in. Please try again.',
      };
    }
  }

  /**
   * Clock Out - End current session or update session end time
   */
  async clockOut(clockOutDto: ClockOutDto): Promise<{ success: boolean; message: string; duration?: number }> {
    try {
      const { userId, clientTime } = clockOutDto;

      this.logger.log(`🔴 Clock Out attempt for user ${userId} at ${clientTime}`);
      this.logger.log(`🔍 ClockOut: Looking for active session for user ${userId}`);

      // Prefer DB stored procedure if enabled
      const useDbSp = (process.env.USE_DB_SP_CLOCK ?? 'true').toLowerCase() !== 'false';
      if (useDbSp) {
        try {
          const raw = await this.dataSource.manager.query('CALL sp_clock_out(?, ?)', [userId, clientTime]);
          const rows = Array.isArray(raw) ? (Array.isArray(raw[0]) ? raw[0] : raw) : [];
          const r = rows[0] || {};
          const ok = (r.result || '').toString().toLowerCase() === 'ok';
          return {
            success: ok,
            message: r.message || (ok ? 'Successfully clocked out' : 'Clock out failed'),
            duration: r.durationMinutes ? Number(r.durationMinutes) : undefined,
          };
        } catch (spErr) {
          this.logger.warn(`SP clock_out failed, falling back to TypeORM logic: ${spErr.message}`);
        }
      }

      // Find TODAY's active session (using Africa/Nairobi timezone)
      const now = new Date();
      // Convert to Africa/Nairobi timezone (UTC+3) - same logic as clock-in
      const nairobiTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      const todayStr = nairobiTime.toISOString().slice(0, 10); // YYYY-MM-DD format
      
      const activeSession = await this.loginHistoryRepository
        .createQueryBuilder('session')
        .where('session.userId = :userId', { userId })
        .andWhere('session.status = :status', { status: 1 })
        .andWhere('DATE(session.sessionStart) = :today', { today: todayStr })
        .orderBy('session.sessionStart', 'DESC')
        .getOne();

      if (!activeSession) {
        this.logger.warn(`⚠️ User ${userId} has no active session to clock out`);
        this.logger.log(`🔍 ClockOut: No active session found for user ${userId} on ${todayStr}`);
        return {
          success: false,
          message: 'You are not currently clocked in.',
        };
      }

      this.logger.log(`✅ ClockOut: Found active session ${activeSession.id} for user ${userId}`);

      // Calculate duration from original start time to current end time
      const startTime = this.parseNairobiTime(activeSession.sessionStart);
      const endTime = this.parseNairobiTime(clientTime);
      const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      // Validate duration (max 8 hours = 480 minutes)
      const validatedDuration = Math.min(durationMinutes, 480);
      
      // If duration exceeds 8 hours, cap the end time to 6:00 PM of the start day
      let finalEndTime = clientTime; // Store client time directly (already in Nairobi time)
      if (durationMinutes > 480) {
        const cappedEndTime = new Date(startTime);
        cappedEndTime.setHours(18, 0, 0, 0); // 6:00 PM
        finalEndTime = cappedEndTime.toISOString().slice(0, 19).replace('T', ' ');
        this.logger.warn(`⚠️ Session duration exceeded 8 hours, capping end time to 6:00 PM for user ${userId}`);
      }

      // Update session
      await this.loginHistoryRepository.update(activeSession.id, {
        status: 2, // Ended
        sessionEnd: finalEndTime,
        duration: validatedDuration,
      });

      this.logger.log(`✅ User ${userId} clocked out successfully. Duration: ${validatedDuration} minutes`);

      return {
        success: true,
        message: 'Successfully clocked out',
        duration: validatedDuration,
      };
    } catch (error) {
      this.logger.error(`❌ Clock Out failed for user ${clockOutDto.userId}: ${error.message}`);
      return {
        success: false,
        message: 'Failed to clock out. Please try again.',
      };
    }
  }

  /**
   * Get current clock status
   */
  async getCurrentStatus(userId: number): Promise<{ 
    isClockedIn: boolean; 
    sessionStart?: string; 
    sessionEnd?: string;
    duration?: number; 
    sessionId?: number;
    status?: string;
    clockInTime?: string;
    clockOutTime?: string;
    createdAt?: string;
  }> {
    try {
      this.logger.log(`🔍 GetCurrentStatus called for user ${userId}`);
      // Check for TODAY's active session (using Africa/Nairobi timezone)
      const now = new Date();
      // Convert to Africa/Nairobi timezone (UTC+3) - same logic as clock-in/out
      const nairobiTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      const todayStr = nairobiTime.toISOString().slice(0, 10); // YYYY-MM-DD format
      
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
        this.logger.log(`📊 Returning: { isClockedIn: false }`);
        return { isClockedIn: false };
      }

      // Calculate current duration
      const startTime = this.parseNairobiTime(activeSession.sessionStart);
      const currentTime = new Date();
      const currentDuration = Math.floor((currentTime.getTime() - startTime.getTime()) / (1000 * 60));

      this.logger.log(`📊 User ${userId} has active session for today: ${activeSession.sessionStart}, duration: ${currentDuration} minutes`);

      const response = {
        isClockedIn: true,
        sessionStart: activeSession.sessionStart,
        sessionEnd: null, // Active sessions don't have session end
        duration: currentDuration,
        sessionId: activeSession.id,
        status: activeSession.status === 1 ? 'active' : 'completed',
        clockInTime: activeSession.sessionStart,
        clockOutTime: null, // Active sessions don't have clock out time
        createdAt: activeSession.sessionStart,
      };

      this.logger.log(`📊 Returning response: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      this.logger.error(`❌ Get current status failed for user ${userId}: ${error.message}`);
      return { isClockedIn: false };
    }
  }

  // getTodaySessions method removed - use getUserSessions(period: 'today') instead

  /**
   * Get user sessions with unified method
   */
  async getUserSessions(
    userId: number,
    period: 'today' | 'week' | 'month' | 'custom',
    startDate?: string,
    endDate?: string,
    limit: number = 50
  ): Promise<{ sessions: any[], statistics: any }> {
    try {
      this.logger.log(`📊 Getting user sessions for user ${userId}, period: ${period}`);

      // Calculate date range based on period
      const { start, end } = this.calculateDateRange(period, startDate, endDate);
      
      this.logger.log(`📅 Date range: ${start} to ${end}`);

      // More flexible query with better date handling
      this.logger.log(`🔍 SQL Query: SELECT * FROM LoginHistory WHERE userId = ${userId} AND DATE(sessionStart) BETWEEN '${start}' AND '${end}' ORDER BY sessionStart DESC LIMIT ${limit}`);
      
      // Use a more flexible query that handles different date formats
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
      } else {
        this.logger.log(`🔍 No sessions found for user ${userId} in date range ${start} to ${end}`);
      }

      // Calculate statistics (always include monthly attendance)
      const statistics = await this.calculateStatistics(sessions, period, start, end, userId);

      // Format sessions with all needed fields
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
    } catch (error) {
      this.logger.error(`❌ Get user sessions failed for user ${userId}: ${error.message}`);
      return { sessions: [], statistics: this.getEmptyStatistics() };
    }
  }

  /**
   * Calculate date range based on period - more flexible and dynamic
   */
  private calculateDateRange(period: string, startDate?: string, endDate?: string): { start: string, end: string } {
    const now = new Date();
    
    switch (period) {
      case 'today':
        const today = now.toISOString().split('T')[0];
        return { start: today, end: today };
        
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
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
        // Validate custom dates
        if (!startDate || !endDate) {
          this.logger.warn('Custom period requires both startDate and endDate');
          const today = now.toISOString().split('T')[0];
          return { start: today, end: today };
        }
        
        // Validate date format and ensure startDate <= endDate
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          this.logger.warn('Invalid date format provided');
          const today = now.toISOString().split('T')[0];
          return { start: today, end: today };
        }
        
        // Ensure startDate is not after endDate
        if (start > end) {
          this.logger.warn('startDate is after endDate, swapping dates');
          return { start: endDate, end: startDate };
        }
        
        return { start: startDate, end: endDate };
        
      default:
        // For unknown periods, return a broader range (last 30 days)
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return { 
          start: thirtyDaysAgo.toISOString().split('T')[0], 
          end: now.toISOString().split('T')[0] 
        };
    }
  }

  /**
   * Calculate statistics from sessions
   */
  private async calculateStatistics(sessions: any[], period: string, startDate: string, endDate: string, userId: number): Promise<any> {
    const totalSessions = sessions.length;
    const activeSessions = sessions.filter(s => s.status === 1).length;
    const completedSessions = sessions.filter(s => s.status === 2).length;
    
    const totalDuration = sessions
      .filter(s => s.duration !== null)
      .reduce((sum, session) => sum + session.duration, 0);
    
    const totalHours = Math.round((totalDuration / 60) * 100) / 100; // Round to 2 decimal places
    
    const averageDuration = completedSessions > 0 ? Math.round(totalDuration / completedSessions) : 0;
    const averageHours = Math.round((averageDuration / 60) * 100) / 100;

    // Always calculate monthly attendance regardless of the selected period
    const monthlyAttendance = await this.calculateMonthlyAttendance(userId);

    return {
      totalSessions,
      activeSessions,
      completedSessions,
      totalDuration, // in minutes
      totalHours,
      averageDuration, // in minutes
      averageHours,
      workedDays: monthlyAttendance.workedDays,
      totalWorkingDays: monthlyAttendance.totalWorkingDays,
      attendanceRatio: `${monthlyAttendance.workedDays}/${monthlyAttendance.totalWorkingDays}`,
    };
  }

  /**
   * Calculate monthly attendance (always for current month, regardless of filter)
   */
  private async calculateMonthlyAttendance(userId: number): Promise<{ workedDays: number, totalWorkingDays: number }> {
    try {
      // Get current month's date range
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startStr = startOfMonth.toISOString().split('T')[0];
      const endStr = endOfMonth.toISOString().split('T')[0];
      
      // Get all sessions for the current month
      const monthlySessions = await this.loginHistoryRepository
        .createQueryBuilder('session')
        .where('session.userId = :userId', { userId })
        .andWhere('DATE(session.sessionStart) >= :start', { start: startStr })
        .andWhere('DATE(session.sessionStart) <= :end', { end: endStr })
        .getMany();
      
      // Calculate worked days (excluding Sundays)
      const workedDaysSet = new Set<string>();
      monthlySessions.forEach(session => {
        const sessionDate = new Date(session.sessionStart);
        const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        
        // Only count if it's not a Sunday
        if (dayOfWeek !== 0) {
          const dateStr = sessionDate.toISOString().split('T')[0]; // YYYY-MM-DD
          workedDaysSet.add(dateStr);
        }
      });
      
      const workedDays = workedDaysSet.size;
      
      // Calculate total working days in the current month (excluding Sundays)
      let totalWorkingDays = 0;
      const currentDate = new Date(startOfMonth);
      while (currentDate <= endOfMonth) {
        const dayOfWeek = currentDate.getDay();
        // Only count if it's not a Sunday
        if (dayOfWeek !== 0) {
          totalWorkingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      this.logger.log(`📊 Monthly attendance: ${workedDays} worked days out of ${totalWorkingDays} total working days in ${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`);
      this.logger.log(`📊 Monthly sessions found: ${monthlySessions.length} sessions from ${startStr} to ${endStr}`);
      
      return { workedDays, totalWorkingDays };
    } catch (error) {
      this.logger.error(`❌ Failed to calculate monthly attendance: ${error.message}`);
      return { workedDays: 0, totalWorkingDays: 0 };
    }
  }

  /**
   * Calculate attendance days (worked days / total working days, excluding Sundays)
   */
  private calculateAttendanceDays(sessions: any[], period: string, startDate: string, endDate: string): { workedDays: number, totalWorkingDays: number } {
    try {
      // Get unique worked days (excluding Sundays)
      const workedDaysSet = new Set<string>();
      sessions.forEach(session => {
        const sessionDate = new Date(session.sessionStart);
        const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        
        // Only count if it's not a Sunday
        if (dayOfWeek !== 0) {
          const dateStr = sessionDate.toISOString().split('T')[0]; // YYYY-MM-DD
          workedDaysSet.add(dateStr);
        }
      });
      
      const workedDays = workedDaysSet.size;
      
      // Calculate total working days in the period (excluding Sundays)
      const start = new Date(startDate);
      const end = new Date(endDate);
      let totalWorkingDays = 0;
      
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        // Only count if it's not a Sunday
        if (dayOfWeek !== 0) {
          totalWorkingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      this.logger.log(`📊 Attendance calculation: ${workedDays} worked days out of ${totalWorkingDays} total working days`);
      
      return { workedDays, totalWorkingDays };
    } catch (error) {
      this.logger.error(`❌ Failed to calculate attendance days: ${error.message}`);
      return { workedDays: 0, totalWorkingDays: 0 };
    }
  }

  /**
   * Get empty statistics
   */
  private getEmptyStatistics(): any {
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


  /**
   * Format date time for display
   */
  private formatDateTime(dateTimeStr: string): string {
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
    } catch (e) {
      return dateTimeStr;
    }
  }

  /**
   * Format duration in hours and minutes
   */
  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${remainingMinutes}m`;
    }
  }

  /**
   * Parse Nairobi time consistently - ensures timezone is handled correctly
   */
  private parseNairobiTime(timeString: string): Date {
    // If timeString is in the format "YYYY-MM-DD HH:mm:ss", parse it as Nairobi time
    if (timeString.includes(' ')) {
      // Since we store times as Nairobi time in the database, parse them as Nairobi time
      return new Date(timeString.replace(' ', 'T') + '+03:00');
    }
    // If it's already in ISO format, parse as is
    return new Date(timeString);
  }

  // Cleanup methods removed - simplified logic

  // getTodaySession method removed - logic moved inline to clockIn method

  /**
   * Force clock out a user (admin function)
   */
  async forceClockOut(userId: number): Promise<{ success: boolean; message: string; closedSessions?: number }> {
    try {
      this.logger.log(`🔧 Force clock out requested for user ${userId}`);

      // Find all active sessions for the user
      const activeSessions = await this.loginHistoryRepository.find({
        where: {
          userId,
          status: 1, // Active sessions
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
        const startTime = this.parseNairobiTime(session.sessionStart);
        const endTime = new Date(startTime);
        endTime.setHours(18, 0, 0, 0); // 6:00 PM
        
        const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

        await this.loginHistoryRepository.update(session.id, {
          status: 2, // Ended
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
    } catch (error) {
      this.logger.error(`❌ Force clock out failed for user ${userId}: ${error.message}`);
      return {
        success: false,
        message: 'Failed to force clock out. Please try again.',
      };
    }
  }
} 