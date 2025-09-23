import { Controller, Get, Query, UseGuards, Req, ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryResponse } from './dashboard.types';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @CacheTTL(60)
  async getSummary(
    @Req() req: any,
    @Query('userId') userId?: string,
    @Query('date') date?: string, // YYYY-MM-DD
  ): Promise<DashboardSummaryResponse> {
    // Server-side feature flag for safe rollout/rollback
    const enabled = (process.env.USE_CONSOLIDATED_DASHBOARD ?? 'true').toLowerCase() !== 'false';
    if (!enabled) {
      throw new ServiceUnavailableException('Consolidated dashboard is temporarily disabled');
    }

    const requesterId = parseInt(req.user?.sub || req.user?.id, 10);
    const requestedUserId = parseInt(userId ?? String(requesterId), 10);
    const isAdmin = typeof req.user?.role === 'string' && req.user.role.toUpperCase().includes('ADMIN');

    if (!isAdmin && requestedUserId !== requesterId) {
      throw new ForbiddenException('You are not allowed to access other users\' data');
    }

    const resolvedUserId = requestedUserId;
    const resolvedDate = date ?? new Date().toISOString().slice(0, 10);

    const cards = await this.dashboardService.getSummary(resolvedUserId, resolvedDate);

    // Return shape the Flutter app can map directly
    return {
      userId: resolvedUserId,
      date: resolvedDate,
      cards,
    };
  }
}
