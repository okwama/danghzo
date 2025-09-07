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
exports.JourneyPlansController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const journey_plans_service_1 = require("./journey-plans.service");
const create_journey_plan_dto_1 = require("./dto/create-journey-plan.dto");
const update_journey_plan_dto_1 = require("./dto/update-journey-plan.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let JourneyPlansController = class JourneyPlansController {
    constructor(journeyPlansService) {
        this.journeyPlansService = journeyPlansService;
    }
    create(createJourneyPlanDto, req) {
        const userId = req.user?.id;
        return this.journeyPlansService.create(createJourneyPlanDto, userId);
    }
    findAll(req, page = '1', limit = '20', status, timezone = 'Africa/Nairobi', date) {
        const userId = req.user?.id;
        return this.journeyPlansService.findAll({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            timezone,
            date,
            userId,
        });
    }
    findByDate(req, page = '1', limit = '20', status, timezone = 'Africa/Nairobi', startDate, endDate) {
        const userId = req.user?.id;
        const today = new Date().toISOString().split('T')[0];
        const finalStartDate = startDate || today;
        const finalEndDate = endDate || today;
        return this.journeyPlansService.findByDateRange({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            timezone,
            startDate: finalStartDate,
            endDate: finalEndDate,
            userId,
        });
    }
    findOne(id) {
        return this.journeyPlansService.findOne(+id);
    }
    update(id, updateJourneyPlanDto) {
        return this.journeyPlansService.update(+id, updateJourneyPlanDto);
    }
    remove(id) {
        return this.journeyPlansService.remove(+id);
    }
    checkout(id, checkoutDto) {
        return this.journeyPlansService.checkout(+id, checkoutDto);
    }
    async uploadCheckInPhoto(id, file, req) {
        if (!file) {
            throw new common_1.BadRequestException('No photo file provided');
        }
        try {
            const photoUrl = await this.journeyPlansService.uploadCheckInPhoto(+id, file);
            return { photoUrl };
        }
        catch (error) {
            throw error;
        }
    }
};
exports.JourneyPlansController = JourneyPlansController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_journey_plan_dto_1.CreateJourneyPlanDto, Object]),
    __metadata("design:returntype", void 0)
], JourneyPlansController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('timezone')),
    __param(5, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], JourneyPlansController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-date'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('timezone')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], JourneyPlansController.prototype, "findByDate", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JourneyPlansController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_journey_plan_dto_1.UpdateJourneyPlanDto]),
    __metadata("design:returntype", void 0)
], JourneyPlansController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JourneyPlansController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/checkout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JourneyPlansController.prototype, "checkout", null);
__decorate([
    (0, common_1.Post)(':id/upload-photo'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], JourneyPlansController.prototype, "uploadCheckInPhoto", null);
exports.JourneyPlansController = JourneyPlansController = __decorate([
    (0, common_1.Controller)('journey-plans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [journey_plans_service_1.JourneyPlansService])
], JourneyPlansController);
//# sourceMappingURL=journey-plans.controller.js.map