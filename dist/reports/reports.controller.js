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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const reports_service_1 = require("./reports.service");
const user_decorator_1 = require("../auth/decorators/user.decorator");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async submitReport(reportData, authenticatedUserId) {
        try {
            console.log('📋 Reports Controller: Received report submission');
            console.log('📋 Report data:', reportData);
            console.log('📋 Authenticated user ID:', authenticatedUserId);
            const result = await this.reportsService.submitReport(reportData, authenticatedUserId);
            const response = {
                success: true,
                report: {
                    id: result.id,
                    type: reportData.type,
                    journeyPlanId: reportData.journeyPlanId,
                    userId: authenticatedUserId,
                    clientId: reportData.clientId,
                    createdAt: result.createdAt,
                },
                specificReport: result,
                message: 'Report submitted successfully',
            };
            console.log('✅ Reports Controller: Report submitted successfully');
            console.log('✅ Response:', response);
            return response;
        }
        catch (error) {
            console.error('❌ Reports Controller: Report submission failed:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getReportsByJourneyPlan(journeyPlanId, limit, offset, includeRelations, date) {
        try {
            console.log(`🔍 Reports Controller: Getting reports for journey plan ${journeyPlanId}`);
            console.log(`🔍 Query params - limit: ${limit}, offset: ${offset}, includeRelations: ${includeRelations}, date: ${date}`);
            const reports = await this.reportsService.getReportsByJourneyPlan(journeyPlanId, {
                limit: limit ? parseInt(limit.toString()) : undefined,
                offset: offset ? parseInt(offset.toString()) : undefined,
                includeRelations: includeRelations === 'true' || includeRelations === '1',
                date: date ? new Date(date) : undefined,
            });
            return {
                success: true,
                data: reports,
            };
        }
        catch (error) {
            console.error('❌ Reports Controller: Failed to get reports by journey plan:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getTodayReportsByJourneyPlan(journeyPlanId, limit, offset, includeRelations) {
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
        }
        catch (error) {
            console.error('❌ Reports Controller: Failed to get today\'s reports by journey plan:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getVisitsByDate(date, authenticatedUserId, queryUserId) {
        try {
            console.log(`🔍 Reports Controller: Getting visits for date ${date} for authenticated user ${authenticatedUserId}`);
            if (queryUserId && queryUserId !== authenticatedUserId) {
                console.warn(`⚠️ Security warning: User ${authenticatedUserId} attempted to access visits for user ${queryUserId}`);
                throw new common_1.ForbiddenException('You can only view your own visits');
            }
            const visits = await this.reportsService.getVisitsByDate(date, authenticatedUserId);
            console.log(`✅ Found ${visits.length} visits for user ${authenticatedUserId} on ${date}`);
            return {
                success: true,
                data: visits,
            };
        }
        catch (error) {
            console.error('❌ Reports Controller: Failed to get visits by date:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getWeeklyVisits(authenticatedUserId, queryUserId, weekStart) {
        try {
            console.log(`🔍 Reports Controller: Getting weekly visits for authenticated user ${authenticatedUserId}`);
            if (queryUserId && queryUserId !== authenticatedUserId) {
                console.warn(`⚠️ Security warning: User ${authenticatedUserId} attempted to access weekly visits for user ${queryUserId}`);
                throw new common_1.ForbiddenException('You can only view your own visits');
            }
            const targetWeekStart = weekStart ? new Date(weekStart) : this.getWeekStart(new Date());
            console.log(`🔍 Controller debugging:`);
            console.log(`  - authenticatedUserId: ${authenticatedUserId} (type: ${typeof authenticatedUserId})`);
            console.log(`  - targetWeekStart: ${targetWeekStart} (type: ${typeof targetWeekStart})`);
            console.log(`  - targetWeekStart.toISOString(): ${targetWeekStart.toISOString()}`);
            const weeklyVisits = await this.reportsService.getWeeklyVisits(authenticatedUserId, targetWeekStart);
            console.log(`✅ Found weekly visits for user ${authenticatedUserId} starting ${targetWeekStart.toISOString()}`);
            console.log(`🔍 Controller received data:`, JSON.stringify(weeklyVisits, null, 2));
            console.log(`🔍 Controller data type: ${typeof weeklyVisits}`);
            console.log(`🔍 Controller data keys: ${weeklyVisits ? Object.keys(weeklyVisits) : 'null/undefined'}`);
            return {
                success: true,
                data: weeklyVisits,
            };
        }
        catch (error) {
            console.error('❌ Reports Controller: Failed to get weekly visits:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    getWeekStart(date) {
        const weekday = date.getDay();
        const daysToSubtract = weekday === 0 ? 6 : weekday - 1;
        const weekStart = new Date(date.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
        weekStart.setHours(0, 0, 0, 0);
        console.log(`📅 Original date: ${date.toISOString()}, weekday: ${weekday}, days to subtract: ${daysToSubtract}, week start: ${weekStart.toISOString()}`);
        return weekStart;
    }
    async getReportCounts(journeyPlanId) {
        try {
            console.log(`🔍 Reports Controller: Getting report counts${journeyPlanId ? ` for journey plan: ${journeyPlanId}` : ''}`);
            const counts = await this.reportsService.getReportCounts(journeyPlanId ? parseInt(journeyPlanId.toString()) : undefined);
            return {
                success: true,
                data: counts,
            };
        }
        catch (error) {
            console.error('❌ Reports Controller: Failed to get report counts:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getAllReports(limit, offset, includeRelations, userId, clientId, startDate, endDate) {
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
        }
        catch (error) {
            console.error('❌ Reports Controller: Failed to get all reports:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "submitReport", null);
__decorate([
    (0, common_1.Get)('journey-plan/:journeyPlanId'),
    __param(0, (0, common_1.Param)('journeyPlanId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, common_1.Query)('includeRelations')),
    __param(4, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReportsByJourneyPlan", null);
__decorate([
    (0, common_1.Get)('journey-plan/:journeyPlanId/today'),
    __param(0, (0, common_1.Param)('journeyPlanId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, common_1.Query)('includeRelations')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getTodayReportsByJourneyPlan", null);
__decorate([
    (0, common_1.Get)('visits/:date(\\d{4}-\\d{2}-\\d{2})'),
    __param(0, (0, common_1.Param)('date')),
    __param(1, (0, user_decorator_1.User)('id')),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getVisitsByDate", null);
__decorate([
    (0, common_1.Get)('visits/weekly'),
    __param(0, (0, user_decorator_1.User)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('weekStart')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getWeeklyVisits", null);
__decorate([
    (0, common_1.Get)('counts'),
    __param(0, (0, common_1.Query)('journeyPlanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReportCounts", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('includeRelations')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Query)('clientId')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAllReports", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map