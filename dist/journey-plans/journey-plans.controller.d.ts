import { JourneyPlansService } from './journey-plans.service';
import { CreateJourneyPlanDto } from './dto/create-journey-plan.dto';
import { UpdateJourneyPlanDto } from './dto/update-journey-plan.dto';
import { Request } from 'express';
export declare class JourneyPlansController {
    private readonly journeyPlansService;
    constructor(journeyPlansService: JourneyPlansService);
    create(createJourneyPlanDto: CreateJourneyPlanDto, req: Request): Promise<import("./entities/journey-plan.entity").JourneyPlan>;
    findAll(req: Request, page?: string, limit?: string, status?: string, timezone?: string, date?: string): Promise<{
        data: import("./entities/journey-plan.entity").JourneyPlan[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        success: boolean;
    }>;
    findByDate(req: Request, page?: string, limit?: string, status?: string, timezone?: string, startDate?: string, endDate?: string): Promise<{
        data: import("./entities/journey-plan.entity").JourneyPlan[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        success: boolean;
    }>;
    findOne(id: string): Promise<import("./entities/journey-plan.entity").JourneyPlan>;
    update(id: string, updateJourneyPlanDto: UpdateJourneyPlanDto): Promise<import("./entities/journey-plan.entity").JourneyPlan>;
    remove(id: string): Promise<void>;
    checkout(id: string, checkoutDto: {
        checkoutTime?: string;
        checkoutLatitude?: number;
        checkoutLongitude?: number;
    }): Promise<import("./entities/journey-plan.entity").JourneyPlan>;
    uploadCheckInPhoto(id: string, file: Express.Multer.File, req: Request): Promise<{
        photoUrl: string;
    }>;
}
