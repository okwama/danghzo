import type { DashboardCardRow } from './dashboard.service';
export interface DashboardSummaryResponse {
    userId: number;
    date: string;
    cards: DashboardCardRow[];
}
