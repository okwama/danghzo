import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Clients } from '../entities/clients.entity';
import { ClientAssignment } from '../entities/client-assignment.entity';
import { ClientsProspects } from '../entities/clients-prospects.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateProspectDto } from './dto/create-prospect.dto';
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
    @InjectRepository(ClientsProspects)
    private clientsProspectsRepository: Repository<ClientsProspects>,
    private readonly databaseResilienceService: DatabaseResilienceService,
  ) {}

  async create(createProspectDto: CreateProspectDto, userCountryId: number, addedBy: number): Promise<ClientsProspects> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      // Sales reps add clients directly to prospects table
      const prospectData = {
        ...createProspectDto,
        countryId: userCountryId,
        status: 1, // Active prospect
        added_by: addedBy,
        created_at: new Date()
      };
      
      const prospect = this.clientsProspectsRepository.create(prospectData);
      return this.clientsProspectsRepository.save(prospect);
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
          
          // Filter out assignments with null clients and log warnings
          const validAssignments = assignments.filter(assignment => {
            if (!assignment.client) {
              this.logger.warn(`⚠️ Found orphaned assignment ${assignment.id} for user ${userId} - client is null`);
              return false;
            }
            return true;
          });

          if (validAssignments.length > 0) {
            validAssignments.forEach(assignment => {
              this.logger.debug(`   - ${assignment.client.name} (ID: ${assignment.client.id})`);
            });
            // User has assigned clients - return only assigned clients
            return validAssignments.map(assignment => assignment.client);
          } else {
            this.logger.warn(`❌ All assignments for user ${userId} have null clients, returning all clients`);
          }
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

  // Add client to prospects
  async addToProspects(clientId: number, userCountryId: number, addedBy: number): Promise<ClientsProspects | null> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      // First check if client exists and belongs to user's country
      const existingClient = await this.findOne(clientId, userCountryId);
      if (!existingClient) {
        this.logger.warn(`Client ${clientId} not found or not accessible for country ${userCountryId}`);
        return null;
      }

      // Check if client is already in prospects
      const existingProspect = await this.clientsProspectsRepository.findOne({
        where: { 
          name: existingClient.name,
          contact: existingClient.contact,
          countryId: userCountryId
        }
      });

      if (existingProspect) {
        this.logger.warn(`Client ${existingClient.name} is already in prospects`);
        return existingProspect;
      }

      // Create prospect from client data
      const prospectData = {
        name: existingClient.name,
        address: existingClient.address,
        latitude: existingClient.latitude,
        longitude: existingClient.longitude,
        balance: existingClient.balance,
        email: existingClient.email,
        region_id: existingClient.region_id,
        region: existingClient.region,
        route_id: existingClient.route_id,
        route_name: existingClient.route_name,
        route_id_update: existingClient.route_id_update,
        route_name_update: existingClient.route_name_update,
        contact: existingClient.contact,
        tax_pin: existingClient.tax_pin,
        location: existingClient.location,
        status: 1, // Active prospect
        client_type: existingClient.client_type,
        outlet_account: existingClient.outlet_account,
        credit_limit: existingClient.credit_limit,
        payment_terms: existingClient.payment_terms,
        countryId: userCountryId,
        added_by: addedBy,
        created_at: new Date()
      };

      const prospect = this.clientsProspectsRepository.create(prospectData);
      const savedProspect = await this.clientsProspectsRepository.save(prospect);
      
      this.logger.log(`✅ Client ${existingClient.name} added to prospects successfully`);
      return savedProspect;
    }, { maxAttempts: 3, timeout: 15000 });
  }

  // Get all prospects (clients from prospects table)
  async findAllProspects(userCountryId: number, userId?: number): Promise<ClientsProspects[]> {
    return this.databaseResilienceService.executeWithRetry(async () => {
      return this.clientsProspectsRepository.find({
        where: { 
          status: 1, // Only active prospects
          countryId: userCountryId, // Only prospects in user's country
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
        order: { name: 'ASC' },
      });
    }, { maxAttempts: 3, timeout: 20000 });
  }
} 
