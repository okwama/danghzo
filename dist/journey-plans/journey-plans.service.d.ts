import { Repository, DataSource } from 'typeorm';
import { JourneyPlan } from './entities/journey-plan.entity';
import { Clients } from '../entities/clients.entity';
import { SalesRep } from '../entities/sales-rep.entity';
import { CreateJourneyPlanDto } from './dto/create-journey-plan.dto';
import { UpdateJourneyPlanDto } from './dto/update-journey-plan.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
interface FindAllOptions {
    page: number;
    limit: number;
    status?: string;
    timezone?: string;
    date?: string;
    userId?: number;
}
interface FindByDateRangeOptions {
    page: number;
    limit: number;
    status?: string;
    timezone?: string;
    startDate: string;
    endDate: string;
    userId?: number;
}
export declare class JourneyPlansService {
    private journeyPlanRepository;
    private clientsRepository;
    private salesRepRepository;
    private dataSource;
    private cloudinaryService;
    private readonly logger;
    constructor(journeyPlanRepository: Repository<JourneyPlan>, clientsRepository: Repository<Clients>, salesRepRepository: Repository<SalesRep>, dataSource: DataSource, cloudinaryService: CloudinaryService);
    private getFallbackCoordinates;
    private ensureClientCoordinates;
    create(createJourneyPlanDto: CreateJourneyPlanDto, userId?: number): Promise<JourneyPlan>;
    private updateClientRoute;
    findAllWithProcedure(options: FindAllOptions): Promise<{
        data: JourneyPlan[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        success: boolean;
    }>;
    findAll(options: FindAllOptions): Promise<{
        data: JourneyPlan[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        success: boolean;
    }>;
    findByDateRange(options: FindByDateRangeOptions): Promise<{
        data: JourneyPlan[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        success: boolean;
    }>;
    findOne(id: number): Promise<JourneyPlan | null>;
    update(id: number, updateJourneyPlanDto: UpdateJourneyPlanDto): Promise<JourneyPlan | null>;
    uploadCheckInPhoto(journeyPlanId: number, file: Express.Multer.File): Promise<string>;
    remove(id: number): Promise<void>;
    checkout(id: number, checkoutDto: {
        checkoutTime?: string;
        checkoutLatitude?: number;
        checkoutLongitude?: number;
    }): Promise<JourneyPlan>;
}
export {};
