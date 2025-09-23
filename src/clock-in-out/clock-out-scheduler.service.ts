import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginHistory } from '../entities/login-history.entity';

@Injectable()
export class ClockOutSchedulerService {
  private readonly logger = new Logger(ClockOutSchedulerService.name);

  constructor(
    @InjectRepository(LoginHistory)
    private loginHistoryRepository: Repository<LoginHistory>,
  ) {}

  @Cron('0 19 * * *', {
    timeZone: 'Africa/Nairobi'
  }) // 7:00 PM daily (Nairobi time)
  async autoClockOutAllUsers() {
    this.logger.log('🕕 Running automatic clock-out job at 7:00 PM Nairobi time (setting 6:00 PM end time)');
    
    try {
      // Get current date for 6 PM end time (Nairobi timezone)
      const now = new Date();
      // Convert to Africa/Nairobi timezone (UTC+3)
      const nairobiTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      const endTime = new Date(nairobiTime);
      endTime.setHours(18, 0, 0, 0); // 6:00 PM Nairobi time
      
      const formattedEndTime = endTime.toISOString().slice(0, 19).replace('T', ' ');
      
      this.logger.log(`📅 Setting end time to: ${formattedEndTime} (Nairobi time)`);
      
      // Find all active sessions
      const activeSessions = await this.loginHistoryRepository.find({
        where: {
          status: 1, // Active sessions
        },
      });

      this.logger.log(`🔍 Found ${activeSessions.length} active sessions to clock out`);

      let successCount = 0;
      let errorCount = 0;

      // Process each active session
      for (const session of activeSessions) {
        try {
          // Calculate duration from start to 6 PM
          const startTime = new Date(session.sessionStart);
          const endTimeDate = new Date(formattedEndTime);
          const durationMinutes = Math.floor((endTimeDate.getTime() - startTime.getTime()) / (1000 * 60));

          // Update session to clock out at 6 PM
          await this.loginHistoryRepository.update(session.id, {
            status: 2, // Ended
            sessionEnd: formattedEndTime,
            duration: durationMinutes,
          });

          this.logger.log(`✅ Auto clock-out successful for user ${session.userId}. Duration: ${durationMinutes} minutes`);
          successCount++;
        } catch (error) {
          this.logger.error(`❌ Auto clock-out failed for user ${session.userId}: ${error.message}`);
          errorCount++;
        }
      }

      this.logger.log(`🎯 Automatic clock-out completed: ${successCount} successful, ${errorCount} failed`);
      
      // Log summary
      if (successCount > 0) {
        this.logger.log(`✅ Successfully clocked out ${successCount} users at 6:00 PM`);
      }
      if (errorCount > 0) {
        this.logger.warn(`⚠️ Failed to clock out ${errorCount} users`);
      }
      
    } catch (error) {
      this.logger.error('❌ Automatic clock-out job failed:', error);
    }
  }

  // Manual trigger method for testing
  async manualTriggerClockOut() {
    this.logger.log('🔧 Manually triggering automatic clock-out job');
    await this.autoClockOutAllUsers();
  }

  // Vercel cron job endpoint method
  async executeVercelCronJob(): Promise<{ 
    success: boolean; 
    message: string; 
    timestamp: string;
    affectedSessions?: number;
    error?: string;
  }> {
    try {
      this.logger.log('🕕 Vercel cron job triggered: Starting session cleanup');
      
      // Get count before cleanup
      const beforeCount = await this.getActiveSessionsCount();
      this.logger.log(`🔍 Found ${beforeCount} active sessions before cleanup`);
      
      // Execute the cleanup
      await this.autoClockOutAllUsers();
      
      // Get count after cleanup
      const afterCount = await this.getActiveSessionsCount();
      const affectedSessions = beforeCount - afterCount;
      
      this.logger.log(`✅ Vercel cron job completed. Affected ${affectedSessions} sessions`);
      
      return {
        success: true,
        message: 'Session cleanup completed successfully',
        timestamp: new Date().toISOString(),
        affectedSessions: affectedSessions
      };
      
    } catch (error) {
      this.logger.error('❌ Vercel cron job failed:', error);
      
      return {
        success: false,
        message: 'Session cleanup failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get count of active sessions
  async getActiveSessionsCount(): Promise<number> {
    return await this.loginHistoryRepository.count({
      where: {
        status: 1, // Active sessions
      },
    });
  }
}
