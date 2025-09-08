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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfExportService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer = require("puppeteer");
const reports_service_1 = require("./reports.service");
let PdfExportService = class PdfExportService {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async generateVisitsPdf(userId, weekStart, format = 'weekly') {
        try {
            console.log('📄 PDF Export: Starting visits PDF generation');
            console.log(`📄 User ID: ${userId}, Week Start: ${weekStart}, Format: ${format}`);
            const visitsData = weekStart
                ? await this.reportsService.getWeeklyVisits(userId, new Date(weekStart))
                : await this.reportsService.getWeeklyVisits(userId, new Date());
            console.log('📄 PDF Export: Visits data retrieved:', Object.keys(visitsData).length, 'days');
            const htmlContent = this.generateVisitsHtml(visitsData, weekStart, format);
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '15mm',
                    bottom: '20mm',
                    left: '15mm'
                }
            });
            await browser.close();
            console.log('📄 PDF Export: PDF generated successfully');
            return pdfBuffer;
        }
        catch (error) {
            console.error('❌ PDF Export: Failed to generate PDF:', error);
            throw new Error(`Failed to generate PDF: ${error.message}`);
        }
    }
    generateVisitsHtml(visitsData, weekStart, format = 'weekly') {
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const weekStartDate = weekStart ? new Date(weekStart) : new Date();
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6);
        const weekRange = `${weekStartDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })} - ${weekEndDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })}`;
        const totalVisits = Object.values(visitsData).reduce((total, visits) => {
            return total + (Array.isArray(visits) ? visits.length : 0);
        }, 0);
        const totalClients = new Set();
        Object.values(visitsData).forEach((visits) => {
            if (Array.isArray(visits)) {
                visits.forEach((visit) => {
                    if (visit.clientId)
                        totalClients.add(visit.clientId);
                });
            }
        });
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visits Report - ${format === 'weekly' ? weekRange : currentDate}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
        }
        
        .header h1 {
            color: #2563eb;
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header .subtitle {
            color: #6b7280;
            font-size: 16px;
            font-weight: 500;
        }
        
        .summary {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #2563eb;
        }
        
        .summary h2 {
            color: #1e40af;
            font-size: 20px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .stat-card {
            background: white;
            padding: 15px;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
        }
        
        .day-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .day-header {
            background: #2563eb;
            color: white;
            padding: 12px 20px;
            border-radius: 6px 6px 0 0;
            font-weight: 600;
            font-size: 16px;
        }
        
        .day-content {
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 6px 6px;
            padding: 20px;
            background: white;
        }
        
        .visit-item {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 10px;
        }
        
        .visit-item:last-child {
            margin-bottom: 0;
        }
        
        .visit-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .client-name {
            font-weight: 600;
            color: #1f2937;
            font-size: 16px;
        }
        
        .visit-time {
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
        }
        
        .visit-details {
            color: #4b5563;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .no-visits {
            text-align: center;
            color: #9ca3af;
            font-style: italic;
            padding: 20px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        
        @media print {
            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Field Visits Report</h1>
        <div class="subtitle">
            ${format === 'weekly' ? `Week of ${weekRange}` : `Daily Report - ${currentDate}`}
        </div>
    </div>

    <div class="summary">
        <h2>Summary</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${totalVisits}</div>
                <div class="stat-label">Total Visits</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalClients.size}</div>
                <div class="stat-label">Unique Clients</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Object.keys(visitsData).length}</div>
                <div class="stat-label">Active Days</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalVisits > 0 ? (totalVisits / Object.keys(visitsData).length).toFixed(1) : '0'}</div>
                <div class="stat-label">Avg Visits/Day</div>
            </div>
        </div>
    </div>

    ${Object.entries(visitsData).map(([dateKey, visits], index) => {
            const date = new Date(dateKey);
            const dayName = dayNames[date.getDay()];
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            return `
        <div class="day-section ${index > 0 && index % 2 === 0 ? 'page-break' : ''}">
          <div class="day-header">
            ${dayName}, ${formattedDate} (${Array.isArray(visits) ? visits.length : 0} visits)
          </div>
          <div class="day-content">
            ${Array.isArray(visits) && visits.length > 0
                ? visits.map((visit) => `
                  <div class="visit-item">
                    <div class="visit-header">
                      <div class="client-name">${visit.clientName || `Client #${visit.clientId}`}</div>
                      <div class="visit-time">
                        ${visit.visitTime ? new Date(visit.visitTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }) : 'Time not recorded'}
                      </div>
                    </div>
                    <div class="visit-details">
                      ${visit.reportType ? `<strong>Report Type:</strong> ${visit.reportType}<br>` : ''}
                      ${visit.details ? `<strong>Details:</strong> ${visit.details}<br>` : ''}
                      ${visit.location ? `<strong>Location:</strong> ${visit.location}<br>` : ''}
                      ${visit.status ? `<strong>Status:</strong> ${visit.status}` : ''}
                    </div>
                  </div>
                `).join('')
                : '<div class="no-visits">No visits recorded for this day</div>'}
          </div>
        </div>
      `;
        }).join('')}

    <div class="footer">
        <p>Generated on ${currentDate} | Woosh Field Sales Management System</p>
    </div>
</body>
</html>
    `;
    }
};
exports.PdfExportService = PdfExportService;
exports.PdfExportService = PdfExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], PdfExportService);
//# sourceMappingURL=pdf-export.service.js.map