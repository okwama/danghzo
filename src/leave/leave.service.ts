import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Leave } from 'src/entities/leave.entity';
import { LeaveType } from 'src/entities/leave-type.entity';
import { LeaveRequest } from 'src/entities/leave-request.entity';
import { Repository } from 'typeorm';


@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave)
    private leaveRepository: Repository<Leave>,
    @InjectRepository(LeaveType)
    private leaveTypeRepository: Repository<LeaveType>,
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
  ) {}

  async findAll(query: any): Promise<Leave[]> {
    const queryBuilder = this.leaveRepository.createQueryBuilder('leave');
    
    if (query.userId) {
      queryBuilder.where('leave.userId = :userId', { userId: query.userId });
    }
    
    if (query.status) {
      queryBuilder.andWhere('leave.status = :status', { status: query.status });
    }
    
    return queryBuilder.orderBy('leave.createdAt', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Leave> {
    return this.leaveRepository.findOne({ where: { id } });
  }

  async create(createLeaveDto: any): Promise<Leave> {
    try {
      // Convert string dates to Date objects
      if (createLeaveDto.startDate && typeof createLeaveDto.startDate === 'string') {
        createLeaveDto.startDate = new Date(createLeaveDto.startDate);
      }
      if (createLeaveDto.endDate && typeof createLeaveDto.endDate === 'string') {
        createLeaveDto.endDate = new Date(createLeaveDto.endDate);
      }
      
      // Validate required fields (reason is optional)
      if (!createLeaveDto.userId || !createLeaveDto.leaveType || !createLeaveDto.startDate || !createLeaveDto.endDate) {
        throw new Error('Missing required fields: userId, leaveType, startDate, endDate');
      }

      // Normalize optional fields
      if (typeof createLeaveDto.reason === 'string' && createLeaveDto.reason.trim() === '') {
        createLeaveDto.reason = null;
      }
      
    const leave = this.leaveRepository.create(createLeaveDto);
    const result = await this.leaveRepository.save(leave);
      
      // Also create entry in leave_requests table for double entry
      try {
        await this.createLeaveRequest(createLeaveDto);
      } catch (error) {
        console.error('Error creating leave request entry:', error);
        // Don't throw error, continue with leave creation
      }
      
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error('Error creating leave application:', error);
      throw error;
    }
  }

    async createLeaveRequest(createLeaveDto: any): Promise<LeaveRequest> {
    try {
      // Find leave type by name
      const leaveType = await this.leaveTypeRepository.findOne({
        where: { name: createLeaveDto.leaveType }
      });
      
      if (!leaveType) {
        throw new Error(`Leave type '${createLeaveDto.leaveType}' not found`);
      }
      
      const leaveRequestData = {
        employee_id: null, // Set to null for salesreps
        leave_type_id: leaveType.id,
        start_date: createLeaveDto.startDate,
        end_date: createLeaveDto.endDate,
        reason: createLeaveDto.reason,
        attachment_url: createLeaveDto.attachment || null,
        status: 'pending',
        employee_type_id: null, // Set to null for salesreps
        salesrep: createLeaveDto.userId, // Use salesrep field for SalesRep ID
      };
      
      const leaveRequest = this.leaveRequestRepository.create(leaveRequestData);
      const result = await this.leaveRequestRepository.save(leaveRequest);
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw error;
    }
  }

  async update(id: number, updateLeaveDto: any): Promise<Leave> {
    await this.leaveRepository.update(id, updateLeaveDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.leaveRepository.delete(id);
  }

  async getLeaveTypes(): Promise<LeaveType[]> {
    return this.leaveTypeRepository.find({ where: { is_active: true } });
  }

  async getLeaveBalance(userId: number): Promise<any> {
    const leaveTypes = await this.getLeaveTypes();
    const approvedLeaves = await this.leaveRepository.find({
      where: { userId, status: 'APPROVED' },
    });

    const balance = {};
    for (const leaveType of leaveTypes) {
      const usedDays = approvedLeaves
        .filter(leave => leave.leaveType === leaveType.name)
        .reduce((total, leave) => total + leave.durationInDays, 0);
      
      balance[leaveType.name] = {
        totalDays: leaveType.default_days,
        usedDays,
        remainingDays: leaveType.default_days - usedDays,
      };
    }

    return balance;
  }

  async ensureLeaveTypeExists(leaveTypeName: string): Promise<void> {
    try {
      // Check if leave type exists
      const existingType = await this.leaveTypeRepository.findOne({
        where: { name: leaveTypeName }
      });
      
      if (!existingType) {
        // Create the leave type if it doesn't exist
        const newLeaveType = this.leaveTypeRepository.create({
          name: leaveTypeName,
          description: `${leaveTypeName} leave type`,
          default_days: 5, // Default 5 days
          is_active: true,
        });
        
        await this.leaveTypeRepository.save(newLeaveType);
        console.log(`Created leave type: ${leaveTypeName}`);
      }
    } catch (error) {
      console.error('Error ensuring leave type exists:', error);
      // Don't throw error, continue with leave creation
    }
  }
} 