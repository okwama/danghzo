import { ReportsService } from './reports.service';
export declare class PdfExportService {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    generateVisitsPdf(userId: number, weekStart?: string, format?: 'weekly' | 'daily'): Promise<Buffer>;
    private generateVisitsHtml;
}
