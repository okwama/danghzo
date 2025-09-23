import { DataSource } from 'typeorm';
export interface DashboardCardRow {
    id: string;
    title: string;
    mainValue: string;
    subValue: string | null;
    trend?: string | null;
    type: string;
    status?: string | null;
}
export declare class DashboardService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    getSummary(userId: number, date: string): Promise<DashboardCardRow[]>;
}
