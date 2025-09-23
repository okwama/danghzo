import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
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

@Injectable()
export class DashboardService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getSummary(userId: number, date: string): Promise<DashboardCardRow[]> {
    // Execute stored procedure and normalize shape
    const raw = await this.dataSource.manager.query('CALL sp_dashboard_summary(?, ?)', [userId, date]);

    // Depending on driver, CALL may return nested arrays. Try to find the rows array.
    const rows = Array.isArray(raw)
      ? (Array.isArray(raw[0]) ? raw[0] : raw)
      : [];

    // Ensure keys match Flutter expectations exactly; ensure trend is present as null if undefined
    const cards: DashboardCardRow[] = rows.map((r: any) => ({
      id: String(r.id),
      title: String(r.title),
      mainValue: String(r.mainValue),
      subValue: r.subValue != null ? String(r.subValue) : null,
      trend: r.trend != null ? String(r.trend) : null,
      type: String(r.type),
      status: r.status != null ? String(r.status) : 'normal',
    }));

    return cards;
  }
}
