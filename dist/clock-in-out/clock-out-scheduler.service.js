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
var ClockOutSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClockOutSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const login_history_entity_1 = require("../entities/login-history.entity");
let ClockOutSchedulerService = ClockOutSchedulerService_1 = class ClockOutSchedulerService {
    constructor(loginHistoryRepository) {
        this.loginHistoryRepository = loginHistoryRepository;
        this.logger = new common_1.Logger(ClockOutSchedulerService_1.name);
    }
    async autoClockOutAllUsers() {
        this.logger.log('🕕 Running automatic clock-out job at 7:00 PM Nairobi time (setting 6:00 PM end time)');
        try {
            const now = new Date();
            const nairobiTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
            const endTime = new Date(nairobiTime);
            endTime.setHours(18, 0, 0, 0);
            const formattedEndTime = endTime.toISOString().slice(0, 19).replace('T', ' ');
            this.logger.log(`📅 Setting end time to: ${formattedEndTime} (Nairobi time)`);
            const activeSessions = await this.loginHistoryRepository.find({
                where: {
                    status: 1,
                },
            });
            this.logger.log(`🔍 Found ${activeSessions.length} active sessions to clock out`);
            let successCount = 0;
            let errorCount = 0;
            for (const session of activeSessions) {
                try {
                    const startTime = new Date(session.sessionStart);
                    const endTimeDate = new Date(formattedEndTime);
                    const durationMinutes = Math.floor((endTimeDate.getTime() - startTime.getTime()) / (1000 * 60));
                    await this.loginHistoryRepository.update(session.id, {
                        status: 2,
                        sessionEnd: formattedEndTime,
                        duration: durationMinutes,
                    });
                    this.logger.log(`✅ Auto clock-out successful for user ${session.userId}. Duration: ${durationMinutes} minutes`);
                    successCount++;
                }
                catch (error) {
                    this.logger.error(`❌ Auto clock-out failed for user ${session.userId}: ${error.message}`);
                    errorCount++;
                }
            }
            this.logger.log(`🎯 Automatic clock-out completed: ${successCount} successful, ${errorCount} failed`);
            if (successCount > 0) {
                this.logger.log(`✅ Successfully clocked out ${successCount} users at 6:00 PM`);
            }
            if (errorCount > 0) {
                this.logger.warn(`⚠️ Failed to clock out ${errorCount} users`);
            }
        }
        catch (error) {
            this.logger.error('❌ Automatic clock-out job failed:', error);
        }
    }
    async manualTriggerClockOut() {
        this.logger.log('🔧 Manually triggering automatic clock-out job');
        await this.autoClockOutAllUsers();
    }
    async getActiveSessionsCount() {
        return await this.loginHistoryRepository.count({
            where: {
                status: 1,
            },
        });
    }
};
exports.ClockOutSchedulerService = ClockOutSchedulerService;
__decorate([
    (0, schedule_1.Cron)('0 19 * * *', {
        timeZone: 'Africa/Nairobi'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClockOutSchedulerService.prototype, "autoClockOutAllUsers", null);
exports.ClockOutSchedulerService = ClockOutSchedulerService = ClockOutSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(login_history_entity_1.LoginHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClockOutSchedulerService);
//# sourceMappingURL=clock-out-scheduler.service.js.map