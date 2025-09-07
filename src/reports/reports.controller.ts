import { Controller, Post, Get, Param, Body, UseGuards, Query, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { User } from '../auth/decorators/user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async submitReport(@Body() reportData: any, @User('id') authenticatedUserId: number) {
    try {
      console.log('📋 Reports Controller: Received report submission');
      console.log('📋 Report data:', reportData);
      console.log('📋 Authenticated user ID:', authenticatedUserId);
      
      const result = await this.reportsService.submitReport(reportData, authenticatedUserId);
      
      // Format response to match Flutter app expectations
      const response = {
        success: true,
        report: {
          id: result.id,
          type: reportData.type,
          journeyPlanId: reportData.journeyPlanId,
          userId: authenticatedUserId, // Always use the authenticated user ID
          clientId: reportData.clientId,
          createdAt: result.createdAt,
        },
        specificReport: result,
        message: 'Report submitted successfully',
      };
      
      console.log('✅ Reports Controller: Report submitted successfully');
      console.log('✅ Response:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Reports Controller: Report submission failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('journey-plan/:journeyPlanId')
  async getReportsByJourneyPlan(
    @Param('journeyPlanId') journeyPlanId: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('includeRelations') includeRelations?: string,
    @Query('date') date?: string, // Optional date parameter
  ) {
    try {
      console.log(`🔍 Reports Controller: Getting reports for journey plan ${journeyPlanId}`);
      console.log(`🔍 Query params - limit: ${limit}, offset: ${offset}, includeRelations: ${includeRelations}, date: ${date}`);
      
      const reports = await this.reportsService.getReportsByJourneyPlan(journeyPlanId, {
        limit: limit ? parseInt(limit.toString()) : undefined,
        offset: offset ? parseInt(offset.toString()) : undefined,
        includeRelations: includeRelations === 'true' || includeRelations === '1',
        date: date ? new Date(date) : undefined, // Use provided date or default to today
      });
      
      return {
        success: true,
        data: reports,
      };
    } catch (error) {
      console.error('❌ Reports Controller: Failed to get reports by journey plan:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('journey-plan/:journeyPlanId/today')
  async getTodayReportsByJourneyPlan(
    @Param('journeyPlanId') journeyPlanId: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('includeRelations') includeRelations?: string,
  ) {
    try {
      console.log(`🔍 Reports Controller: Getting today's reports for journey plan ${journeyPlanId}`);
      console.log(`🔍 Query params - limit: ${limit}, offset: ${offset}, includeRelations: ${includeRelations}`);
      
      const reports = await this.reportsService.getTodayReportsByJourneyPlan(journeyPlanId, {
        limit: limit ? parseInt(limit.toString()) : undefined,
        offset: offset ? parseInt(offset.toString()) : undefined,
        includeRelations: includeRelations === 'true' || includeRelations === '1',
      });
      
      return {
        success: true,
        data: reports,
      };
    } catch (error) {
      console.error('❌ Reports Controller: Failed to get today\'s reports by journey plan:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('visits/:date(\\d{4}-\\d{2}-\\d{2})')
  async getVisitsByDate(
    @Param('date') date: string,
    @User('id') authenticatedUserId: number,
    @Query('userId') queryUserId?: number,
  ) {
    try {
      console.log(`🔍 Reports Controller: Getting visits for date ${date} for authenticated user ${authenticatedUserId}`);
      
      // Security check: Ensure users can only see their own visits
      if (queryUserId && queryUserId !== authenticatedUserId) {
        console.warn(`⚠️ Security warning: User ${authenticatedUserId} attempted to access visits for user ${queryUserId}`);
        throw new ForbiddenException('You can only view your own visits');
      }
      
      // Always use the authenticated user's ID for security
      const visits = await this.reportsService.getVisitsByDate(date, authenticatedUserId);
      
      console.log(`✅ Found ${visits.length} visits for user ${authenticatedUserId} on ${date}`);
      
      return {
        success: true,
        data: visits,
      };
    } catch (error) {
      console.error('❌ Reports Controller: Failed to get visits by date:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('visits/weekly')
  async getWeeklyVisits(
    @User('id') authenticatedUserId: number,
    @Query('userId') queryUserId?: number,
    @Query('weekStart') weekStart?: string,
  ) {
    try {
      console.log(`🔍 Reports Controller: Getting weekly visits for authenticated user ${authenticatedUserId}`);
      
      // Security check: Ensure users can only see their own visits
      if (queryUserId && queryUserId !== authenticatedUserId) {
        console.warn(`⚠️ Security warning: User ${authenticatedUserId} attempted to access weekly visits for user ${queryUserId}`);
        throw new ForbiddenException('You can only view your own visits');
      }
      
      // Parse week start date or use current week
      const targetWeekStart = weekStart ? new Date(weekStart) : this.getWeekStart(new Date());
      
      console.log(`🔍 Controller debugging:`);
      console.log(`  - authenticatedUserId: ${authenticatedUserId} (type: ${typeof authenticatedUserId})`);
      console.log(`  - targetWeekStart: ${targetWeekStart} (type: ${typeof targetWeekStart})`);
      console.log(`  - targetWeekStart.toISOString(): ${targetWeekStart.toISOString()}`);
      
      // Always use the authenticated user's ID for security
      const weeklyVisits = await this.reportsService.getWeeklyVisits(authenticatedUserId, targetWeekStart);
      
      console.log(`✅ Found weekly visits for user ${authenticatedUserId} starting ${targetWeekStart.toISOString()}`);
      console.log(`🔍 Controller received data:`, JSON.stringify(weeklyVisits, null, 2));
      console.log(`🔍 Controller data type: ${typeof weeklyVisits}`);
      console.log(`🔍 Controller data keys: ${weeklyVisits ? Object.keys(weeklyVisits) : 'null/undefined'}`);
      
      return {
        success: true,
        data: weeklyVisits,
      };
    } catch (error) {
      console.error('❌ Reports Controller: Failed to get weekly visits:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private getWeekStart(date: Date): Date {
    const weekday = date.getDay();
    // getDay() returns: 0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday
    // We want Monday to be day 0, so:
    // Monday (1) -> 0 days to subtract
    // Tuesday (2) -> 1 day to subtract
    // Wednesday (3) -> 2 days to subtract
    // Thursday (4) -> 3 days to subtract
    // Friday (5) -> 4 days to subtract
    // Saturday (6) -> 5 days to subtract
    // Sunday (0) -> 6 days to subtract
    const daysToSubtract = weekday === 0 ? 6 : weekday - 1;
    
    const weekStart = new Date(date.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
    // Reset to beginning of day (00:00:00)
    weekStart.setHours(0, 0, 0, 0);
    
    console.log(`📅 Original date: ${date.toISOString()}, weekday: ${weekday}, days to subtract: ${daysToSubtract}, week start: ${weekStart.toISOString()}`);
    
    return weekStart;
  }

  @Get('counts')
  async getReportCounts(@Query('journeyPlanId') journeyPlanId?: number) {
    try {
      console.log(`🔍 Reports Controller: Getting report counts${journeyPlanId ? ` for journey plan: ${journeyPlanId}` : ''}`);
      
      const counts = await this.reportsService.getReportCounts(
        journeyPlanId ? parseInt(journeyPlanId.toString()) : undefined
      );
      
      return {
        success: true,
        data: counts,
      };
    } catch (error) {
      console.error('❌ Reports Controller: Failed to get report counts:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get()
  async getAllReports(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('includeRelations') includeRelations?: string,
    @Query('userId') userId?: number,
    @Query('clientId') clientId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      console.log('🔍 Reports Controller: Getting all reports with filters');
      console.log(`🔍 Query params - limit: ${limit}, offset: ${offset}, includeRelations: ${includeRelations}, userId: ${userId}, clientId: ${clientId}`);
      
      const reports = await this.reportsService.findAll({
        limit: limit ? parseInt(limit.toString()) : undefined,
        offset: offset ? parseInt(offset.toString()) : undefined,
        includeRelations: includeRelations === 'true' || includeRelations === '1',
        userId: userId ? parseInt(userId.toString()) : undefined,
        clientId: clientId ? parseInt(clientId.toString()) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
      
      return {
        success: true,
        data: reports,
      };
    } catch (error) {
      console.error('❌ Reports Controller: Failed to get all reports:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
