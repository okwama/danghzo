import { DashboardService } from './dashboard.service';
import { DashboardSummaryResponse } from './dashboard.types';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(req: any, userId?: string, date?: string): Promise<DashboardSummaryResponse>;
}
