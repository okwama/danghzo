import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { JourneyPlan } from '../entities/journey-plan.entity';
import { CreateJourneyPlanDto } from './dto/create-journey-plan.dto';
import { UpdateJourneyPlanDto } from './dto/update-journey-plan.dto';

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

@Injectable()
export class JourneyPlansService {
  constructor(
    @InjectRepository(JourneyPlan)
    private journeyPlanRepository: Repository<JourneyPlan>,
  ) {}

  async create(createJourneyPlanDto: CreateJourneyPlanDto, userId?: number): Promise<JourneyPlan> {
    const journeyPlan = this.journeyPlanRepository.create({
      ...createJourneyPlanDto,
      userId: userId,
      status: 0, // pending
      date: new Date(createJourneyPlanDto.date),
    });
    
    const saved = await this.journeyPlanRepository.save(journeyPlan);
    return this.findOne(saved.id);
  }

  async findAll(options: FindAllOptions): Promise<{
    data: JourneyPlan[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    success: boolean;
  }> {
    const { page, limit, status, date, userId } = options;
    const offset = (page - 1) * limit;

    // Build query
    let query = this.journeyPlanRepository
      .createQueryBuilder('journeyPlan')
      .leftJoinAndSelect('journeyPlan.client', 'client')
      .leftJoinAndSelect('journeyPlan.user', 'user');

    // Add filters
    if (userId) {
      query = query.where('journeyPlan.userId = :userId', { userId });
    }

    if (status) {
      const statusMap: { [key: string]: number } = {
        'pending': 0,
        'checked_in': 1,
        'in_progress': 2,
        'completed': 3,
        'cancelled': 4,
      };
      const statusValue = statusMap[status] ?? 0;
      query = query.andWhere('journeyPlan.status = :status', { status: statusValue });
    }

    // Only filter by date if explicitly provided
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      const endOfDay = new Date(targetDate);
      endOfDay.setDate(endOfDay.getDate() + 1);
      
      query = query.andWhere('journeyPlan.date >= :startDate AND journeyPlan.date < :endDate', {
        startDate: startOfDay,
        endDate: endOfDay,
      });
    }

    // Get total count
    const total = await query.getCount();

    // Get paginated results
    const data = await query
      .orderBy('journeyPlan.date', 'DESC')
      .addOrderBy('journeyPlan.time', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      success: true,
    };
  }

  async findByDateRange(options: FindByDateRangeOptions): Promise<{
    data: JourneyPlan[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    success: boolean;
  }> {
    const { page, limit, status, startDate, endDate, userId } = options;
    const offset = (page - 1) * limit;

    // Build query
    let query = this.journeyPlanRepository
      .createQueryBuilder('journeyPlan')
      .leftJoinAndSelect('journeyPlan.client', 'client')
      .leftJoinAndSelect('journeyPlan.user', 'user');

    // Add filters
    if (userId) {
      query = query.where('journeyPlan.userId = :userId', { userId });
    }

    if (status) {
      const statusMap: { [key: string]: number } = {
        'pending': 0,
        'checked_in': 1,
        'in_progress': 2,
        'completed': 3,
        'cancelled': 4,
      };
      const statusValue = statusMap[status] ?? 0;
      query = query.andWhere('journeyPlan.status = :status', { status: statusValue });
    }

    // Filter by date range
    const startOfRange = new Date(startDate);
    const endOfRange = new Date(endDate);
    endOfRange.setDate(endOfRange.getDate() + 1); // Include the end date
    
    query = query.andWhere('journeyPlan.date >= :startDate AND journeyPlan.date < :endDate', {
      startDate: startOfRange,
      endDate: endOfRange,
    });

    // Get total count
    const total = await query.getCount();

    // Get paginated results
    const data = await query
      .orderBy('journeyPlan.date', 'DESC')
      .addOrderBy('journeyPlan.time', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      success: true,
    };
  }

  async findOne(id: number): Promise<JourneyPlan | null> {
    return this.journeyPlanRepository.findOne({
      where: { id },
      relations: ['client', 'user'],
    });
  }

  async update(id: number, updateJourneyPlanDto: UpdateJourneyPlanDto): Promise<JourneyPlan | null> {
    const journeyPlan = await this.findOne(id);
    if (!journeyPlan) {
      throw new NotFoundException(`Journey plan with ID ${id} not found`);
    }

    // Convert status string to number if provided
    let statusValue: number | undefined;
    if (updateJourneyPlanDto.status) {
      const statusMap: { [key: string]: number } = {
        'pending': 0,
        'checked_in': 1,
        'in_progress': 2,
        'completed': 3,
        'cancelled': 4,
      };
      statusValue = statusMap[updateJourneyPlanDto.status] ?? 0;
    }

    // Convert date strings to Date objects
    const updateData: any = { ...updateJourneyPlanDto };
    if (statusValue !== undefined) {
      updateData.status = statusValue;
    }
    if (updateData.checkInTime) {
      updateData.checkInTime = new Date(updateData.checkInTime);
    }
    if (updateData.checkoutTime) {
      updateData.checkoutTime = new Date(updateData.checkoutTime);
    }

    await this.journeyPlanRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const journeyPlan = await this.findOne(id);
    if (!journeyPlan) {
      throw new NotFoundException(`Journey plan with ID ${id} not found`);
    }
    await this.journeyPlanRepository.delete(id);
  }

  async checkout(
    id: number,
    checkoutDto: {
      checkoutTime?: string;
      checkoutLatitude?: number;
      checkoutLongitude?: number;
    },
  ): Promise<JourneyPlan> {
    const journeyPlan = await this.findOne(id);
    if (!journeyPlan) {
      throw new NotFoundException(`Journey plan with ID ${id} not found`);
    }

    const updateData: any = {
      status: 3, // completed
      checkoutTime: checkoutDto.checkoutTime ? new Date(checkoutDto.checkoutTime) : new Date(),
    };

    if (checkoutDto.checkoutLatitude !== undefined) {
      updateData.checkoutLatitude = checkoutDto.checkoutLatitude;
    }
    if (checkoutDto.checkoutLongitude !== undefined) {
      updateData.checkoutLongitude = checkoutDto.checkoutLongitude;
    }

    await this.journeyPlanRepository.update(id, updateData);
    return this.findOne(id);
  }
} 