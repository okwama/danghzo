import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Clients } from '../entities/clients.entity';
import { ClientAssignment } from '../entities/client-assignment.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { SearchClientsDto } from './dto/search-clients.dto';
import { DatabaseResilienceService } from '../config/database-resilience.service';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Clients)
    private clientRepository: Repository<Clients>,
    @InjectRepository(ClientAssignment)
    private clientAssignmentRepository: Repository<ClientAssignment>,
    private readonly databaseResilienceService: DatabaseResilienceService,
  ) {}

  async create(createClientDto: CreateClientDto, userCountryId: number): Promise<Clients> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      // Ensure the client is created in the user's country
      // New clients are created with status 0 (pending approval)
      const clientData = {
        ...createClientDto,
        countryId: userCountryId,
        status: 1, // Pending approval - admin will change to 1 when approved
      };
      
      const client = this.clientRepository.create(clientData);
      return this.clientRepository.save(client);
    }, { maxAttempts: 3, timeout: 15000 });
  }

  async findAll(userCountryId: number, userId?: number): Promise<Clients[]> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      // If userId is provided, check for client assignments
      if (userId) {
        this.logger.debug(`🔍 Checking client assignments for user ${userId}`);
        const assignments = await this.clientAssignmentRepository.find({
          where: { 
            salesRepId: userId, 
            status: 'active' 
          },
          relations: ['client']
        });

        if (assignments.length > 0) {
          this.logger.debug(`✅ User ${userId} has ${assignments.length} assigned clients:`);
          assignments.forEach(assignment => {
            this.logger.debug(`   - ${assignment.client.name} (ID: ${assignment.client.id})`);
          });
          // User has assigned clients - return only assigned clients
          return assignments.map(assignment => assignment.client);
        } else {
          this.logger.debug(`❌ No active assignment found for user ${userId}, returning all clients`);
        }
      }

      // No assignment found or no userId provided - return all clients
      return this.clientRepository.find({
        where: { 
          status: 1, // Only approved/active clients
          countryId: userCountryId, // Only clients in user's country
        },
        select: [
          'id',
          'name', 
          'contact',
          'region',
          'region_id',
          'status',
          'countryId'
        ],
        order: { name: 'ASC' },
      });
    }, { maxAttempts: 3, timeout: 20000 });
  }

  async findOne(id: number, userCountryId: number): Promise<Clients | null> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      return this.clientRepository.findOne({
        where: { 
          id, 
          status: 1, // Only approved/active clients
          countryId: userCountryId, // Only clients in user's country
        },
      });
    }, { maxAttempts: 3, timeout: 10000 });
  }

  async findOneBasic(id: number, userCountryId: number): Promise<Clients | null> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      return this.clientRepository.findOne({
        where: { 
          id, 
          status: 1, // Only approved/active clients
          countryId: userCountryId,
        },
        select: [
          'id',
          'name',
          'contact',
          'region',
          'region_id',
          'status',
          'countryId'
        ],
      });
    }, { maxAttempts: 3, timeout: 10000 });
  }

  async update(id: number, updateClientDto: Partial<CreateClientDto>, userCountryId: number): Promise<Clients | null> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      // First check if client exists and belongs to user's country
      const existingClient = await this.findOne(id, userCountryId);
      if (!existingClient) {
        return null;
      }
      
      await this.clientRepository.update(id, updateClientDto);
      return this.findOne(id, userCountryId);
    }, { maxAttempts: 3, timeout: 15000 });
  }

  // Remove delete functionality for sales reps
  // async remove(id: number): Promise<void> {
  //   await this.clientRepository.update(id, { status: 0 }); // Soft delete
  // }

  async search(searchDto: SearchClientsDto, userCountryId: number): Promise<Clients[]> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      const { query, regionId, routeId, status } = searchDto;
      
      const whereConditions: any = {
        countryId: userCountryId, // Always filter by user's country
      };
      
      if (regionId) whereConditions.region_id = regionId;
      if (routeId) whereConditions.route_id = routeId;
      if (status !== undefined) whereConditions.status = status;
      
      const queryBuilder = this.clientRepository.createQueryBuilder('client');
      
      // Add where conditions
      Object.keys(whereConditions).forEach(key => {
        queryBuilder.andWhere(`client.${key} = :${key}`, { [key]: whereConditions[key] });
      });
      
      // Add search query
      if (query) {
        queryBuilder.andWhere(
          '(client.name LIKE :query OR client.contact LIKE :query OR client.email LIKE :query OR client.address LIKE :query)',
          { query: `%${query}%` }
        );
      }
      
      return queryBuilder
        .select([
          'client.id',
          'client.name',
          'client.contact',
          'client.region',
          'client.region_id',
          'client.status',
          'client.countryId'
        ])
        .orderBy('client.name', 'ASC')
        .getMany();
    }, { maxAttempts: 3, timeout: 20000 });
  }

  async findByCountry(countryId: number, userCountryId: number): Promise<Clients[]> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      // Only allow access if user is requesting their own country
      if (countryId !== userCountryId) {
        return [];
      }
      
      return this.clientRepository.find({
        where: { countryId, status: 1 },
        select: [
          'id',
          'name',
          'contact',
          'region',
          'region_id',
          'status',
          'countryId'
        ],
        order: { name: 'ASC' },
      });
    }, { maxAttempts: 3, timeout: 20000 });
  }

  async findByRegion(regionId: number, userCountryId: number): Promise<Clients[]> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      return this.clientRepository.find({
        where: { 
          region_id: regionId, 
          status: 1,
          countryId: userCountryId, // Only clients in user's country
        },
        select: [
          'id',
          'name',
          'contact',
          'region',
          'region_id',
          'status',
          'countryId'
        ],
        order: { name: 'ASC' },
      });
    }, { maxAttempts: 3, timeout: 20000 });
  }

  async findByRoute(routeId: number, userCountryId: number): Promise<Clients[]> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      return this.clientRepository.find({
        where: { 
          route_id: routeId, 
          status: 1,
          countryId: userCountryId, // Only clients in user's country
        },
        select: [
          'id',
          'name',
          'contact',
          'region',
          'region_id',
          'status',
          'countryId'
        ],
        order: { name: 'ASC' },
      });
    }, { maxAttempts: 3, timeout: 20000 });
  }

  async findByLocation(latitude: number, longitude: number, radius: number = 10, userCountryId: number): Promise<Clients[]> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      // Simple distance calculation using Haversine formula with country filter
      const query = `
        SELECT *, 
          (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
        FROM Clients 
        WHERE status = 1 AND countryId = ?
        HAVING distance <= ?
        ORDER BY distance
      `;
      
      return this.clientRepository.query(query, [latitude, longitude, latitude, userCountryId, radius]);
    }, { maxAttempts: 3, timeout: 25000 });
  }

  async getClientStats(userCountryId: number, regionId?: number): Promise<any> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      const queryBuilder = this.clientRepository.createQueryBuilder('client');
      
      // Always filter by user's country
      queryBuilder.where('client.countryId = :countryId', { countryId: userCountryId });
      
      if (regionId) {
        queryBuilder.andWhere('client.region_id = :regionId', { regionId });
      }
      
      const total = await queryBuilder.getCount();
      const active = await queryBuilder.where('client.status = 1').getCount();
      const inactive = await queryBuilder.where('client.status = 0').getCount();
      
      return {
        total,
        active,
        inactive,
        activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
      };
    }, { maxAttempts: 3, timeout: 15000 });
  }

  // Get pending clients for admin approval
  async findPendingClients(userCountryId: number): Promise<Clients[]> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      return this.clientRepository.find({
        where: { 
          status: 0, // Pending approval clients
          countryId: userCountryId, // Only clients in user's country
        },
        select: [
          'id',
          'name', 
          'contact',
          'region',
          'region_id',
          'status',
          'countryId',
          'email',
          'address',
          'created_at',
          'added_by'
        ],
        order: { created_at: 'DESC' },
      });
    }, { maxAttempts: 3, timeout: 20000 });
  }

  // Approve a client (admin only)
  async approveClient(id: number, userCountryId: number): Promise<Clients | null> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      // First check if client exists and belongs to user's country
      const existingClient = await this.clientRepository.findOne({
        where: { 
          id, 
          status: 0, // Only pending clients can be approved
          countryId: userCountryId,
        },
      });
      
      if (!existingClient) {
        return null;
      }
      
      await this.clientRepository.update(id, { status: 1 });
      return this.findOne(id, userCountryId);
    }, { maxAttempts: 3, timeout: 15000 });
  }

  // Reject a client (admin only)
  async rejectClient(id: number, userCountryId: number): Promise<boolean> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      // First check if client exists and belongs to user's country
      const existingClient = await this.clientRepository.findOne({
        where: { 
          id, 
          status: 0, // Only pending clients can be rejected
          countryId: userCountryId,
        },
      });
      
      if (!existingClient) {
        return false;
      }
      
      await this.clientRepository.update(id, { status: 2 }); // 2 = rejected
      return true;
    }, { maxAttempts: 3, timeout: 15000 });
  }
} 
