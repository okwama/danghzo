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
exports.ClockInOutController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const clock_in_out_service_1 = require("./clock-in-out.service");
const clock_out_scheduler_service_1 = require("./clock-out-scheduler.service");
const dto_1 = require("./dto");
let ClockInOutController = class ClockInOutController {
    constructor(clockInOutService, clockOutSchedulerService) {
        this.clockInOutService = clockInOutService;
        this.clockOutSchedulerService = clockOutSchedulerService;
    }
    async clockIn(clockInDto) {
        return await this.clockInOutService.clockIn(clockInDto);
    }
    async clockOut(clockOutDto) {
        return await this.clockInOutService.clockOut(clockOutDto);
    }
    async getCurrentStatus(userId) {
        return await this.clockInOutService.getCurrentStatus(parseInt(userId));
    }
    async getTodaySessions(userId) {
        return await this.clockInOutService.getTodaySessions(parseInt(userId));
    }
    async getClockHistory(userId, startDate, endDate) {
        return await this.clockInOutService.getClockSessionsWithProcedure(parseInt(userId), startDate, endDate);
    }
    async triggerAutoClockOut() {
        return await this.clockOutSchedulerService.manualTriggerClockOut();
    }
    async getActiveSessionsCount() {
        const count = await this.clockOutSchedulerService.getActiveSessionsCount();
        return { activeSessionsCount: count };
    }
    async forceClockOut(userId) {
        return await this.clockInOutService.forceClockOut(parseInt(userId));
    }
};
exports.ClockInOutController = ClockInOutController;
__decorate([
    (0, common_1.Post)('clock-in'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ClockInDto]),
    __metadata("design:returntype", Promise)
], ClockInOutController.prototype, "clockIn", null);
__decorate([
    (0, common_1.Post)('clock-out'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ClockOutDto]),
    __metadata("design:returntype", Promise)
], ClockInOutController.prototype, "clockOut", null);
__decorate([
    (0, common_1.Get)('status/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClockInOutController.prototype, "getCurrentStatus", null);
__decorate([
    (0, common_1.Get)('today/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClockInOutController.prototype, "getTodaySessions", null);
__decorate([
    (0, common_1.Get)('history/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ClockInOutController.prototype, "getClockHistory", null);
__decorate([
    (0, common_1.Post)('trigger-auto-clockout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClockInOutController.prototype, "triggerAutoClockOut", null);
__decorate([
    (0, common_1.Get)('active-sessions-count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClockInOutController.prototype, "getActiveSessionsCount", null);
__decorate([
    (0, common_1.Post)('force-clockout/:userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClockInOutController.prototype, "forceClockOut", null);
exports.ClockInOutController = ClockInOutController = __decorate([
    (0, common_1.Controller)('clock-in-out'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [clock_in_out_service_1.ClockInOutService,
        clock_out_scheduler_service_1.ClockOutSchedulerService])
], ClockInOutController);
//# sourceMappingURL=clock-in-out.controller.js.map