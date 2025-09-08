import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { SearchClientsDto } from './dto/search-clients.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DataCacheService } from '../cache/data-cache.service';
import { DatabaseResilienceService } from '../config/database-resilience.service';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsCachedController {
  private readonly logger = new Logger(ClientsCachedController.name);

  constructor(
    private readonly clientsService: ClientsService,
    private readonly dataCacheService: DataCacheService,
    private readonly databaseResilienceService: DatabaseResilienceService,
  ) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto, @Request() req) {
    try {
      const userCountryId = req.user.countryId;
      
      // Check database connectivity first
      const isConnected = await this.databaseResilienceService.testConnection();
      if (!isConnected) {
        throw new HttpException('Database connection unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      }

      const result = await this.clientsService.create(createClientDto, userCountryId, req.user.id);
      
      // Invalidate clients cache after creating new client
      await this.dataCacheService.invalidateClientsCache();
      
      return {
        success: true,
        data: result,
        message: 'Client created successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error creating client:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      return {
        success: false,
        error: 'Failed to create client',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get all clients with pagination and caching
   */
  @Get()
  async findAll(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('region') region?: string,
    @Query('route') route?: string,
  ) {
    try {
      const userCountryId = req.user.countryId;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      
      // Create filters object for cache key
      const filters = { search, region, route, countryId: userCountryId };
      
      // Try to get from cache first
      const cachedClients = await this.dataCacheService.getCachedClientsList(pageNum, limitNum, filters);
      if (cachedClients) {
        this.logger.log(`Clients list served from cache for page ${pageNum}`);
        return {
          success: true,
          data: cachedClients,
          fromCache: true,
          pagination: {
            page: pageNum,
            limit: limitNum,
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Check database connectivity before fetching
      const isConnected = await this.databaseResilienceService.testConnection();
      if (!isConnected) {
        throw new HttpException('Database connection unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      }

      // If not in cache, fetch from database
      this.logger.log(`Fetching clients from database for page ${pageNum}`);
      const clients = await this.clientsService.findAll(userCountryId);
      
      // Cache the result
      await this.dataCacheService.cacheClientsList(pageNum, limitNum, clients, filters);
      
      return {
        success: true,
        data: clients,
        fromCache: false,
        pagination: {
          page: pageNum,
          limit: limitNum,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching clients:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      return {
        success: false,
        error: 'Failed to fetch clients',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get basic clients list with caching
   */
  @Get('basic')
  async findAllBasic(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    try {
      const userCountryId = req.user.countryId;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      
      const filters = { basic: true, countryId: userCountryId };
      
      // Try to get from cache first
      const cachedClients = await this.dataCacheService.getCachedClientsList(pageNum, limitNum, filters);
      if (cachedClients) {
        this.logger.log(`Basic clients list served from cache for page ${pageNum}`);
        return {
          success: true,
          data: cachedClients,
          fromCache: true,
          pagination: {
            page: pageNum,
            limit: limitNum,
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Check database connectivity before fetching
      const isConnected = await this.databaseResilienceService.testConnection();
      if (!isConnected) {
        throw new HttpException('Database connection unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      }

      // If not in cache, fetch from database
      this.logger.log(`Fetching basic clients from database for page ${pageNum}`);
      const clients = await this.clientsService.findAll(userCountryId);
      
      // Cache the result
      await this.dataCacheService.cacheClientsList(pageNum, limitNum, clients, filters);
      
      return {
        success: true,
        data: clients,
        fromCache: false,
        pagination: {
          page: pageNum,
          limit: limitNum,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching basic clients:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      return {
        success: false,
        error: 'Failed to fetch basic clients',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Search clients with caching
   */
  @Get('search')
  async search(
    @Query() searchDto: SearchClientsDto,
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    try {
      const userCountryId = req.user.countryId;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      
      const filters = { ...searchDto, countryId: userCountryId };
      
      // Try to get from cache first
      const cachedClients = await this.dataCacheService.getCachedClientsList(pageNum, limitNum, filters);
      if (cachedClients) {
        this.logger.log(`Search results served from cache for page ${pageNum}`);
        return {
          success: true,
          data: cachedClients,
          fromCache: true,
          search: searchDto,
          pagination: {
            page: pageNum,
            limit: limitNum,
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Check database connectivity before searching
      const isConnected = await this.databaseResilienceService.testConnection();
      if (!isConnected) {
        throw new HttpException('Database connection unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      }

      // If not in cache, fetch from database
      this.logger.log(`Searching clients in database for page ${pageNum}`);
      const clients = await this.clientsService.search(searchDto, userCountryId);
      
      // Cache the result
      await this.dataCacheService.cacheClientsList(pageNum, limitNum, clients, filters);
      
      return {
        success: true,
        data: clients,
        fromCache: false,
        search: searchDto,
        pagination: {
          page: pageNum,
          limit: limitNum,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error searching clients:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      return {
        success: false,
        error: 'Failed to search clients',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get single client with caching
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    try {
      const userCountryId = req.user.countryId;
      const clientId = parseInt(id, 10);
      
      // Try to get from cache first
      const cachedClient = await this.dataCacheService.getCachedClientDetail(clientId);
      if (cachedClient) {
        this.logger.log(`Client detail served from cache for ID ${clientId}`);
        return {
          success: true,
          data: cachedClient,
          fromCache: true,
          timestamp: new Date().toISOString(),
        };
      }

      // Check database connectivity before fetching
      const isConnected = await this.databaseResilienceService.testConnection();
      if (!isConnected) {
        throw new HttpException('Database connection unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      }

      // If not in cache, fetch from database
      this.logger.log(`Fetching client from database for ID ${clientId}`);
      const client = await this.clientsService.findOne(clientId, userCountryId);
      
      // Cache the result
      await this.dataCacheService.cacheClientDetail(clientId, client);
      
      return {
        success: true,
        data: client,
        fromCache: false,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching client:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      return {
        success: false,
        error: 'Failed to fetch client',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Update client and invalidate cache
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: Partial<CreateClientDto>,
    @Request() req
  ) {
    try {
      const userCountryId = req.user.countryId;
      const clientId = parseInt(id, 10);
      
      // Check database connectivity first
      const isConnected = await this.databaseResilienceService.testConnection();
      if (!isConnected) {
        throw new HttpException('Database connection unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      }
      
      const result = await this.clientsService.update(clientId, updateClientDto, userCountryId);
      
      // Invalidate specific client cache and list cache
      await Promise.all([
        this.dataCacheService.invalidateClientCache(clientId),
        this.dataCacheService.invalidateClientsCache(),
      ]);
      
      return {
        success: true,
        data: result,
        message: 'Client updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error updating client:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      return {
        success: false,
        error: 'Failed to update client',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get clients by country with caching
   */
  @Get('country/:countryId')
  async findByCountry(
    @Param('countryId') countryId: string,
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    try {
      const userCountryId = req.user.countryId;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      
      const filters = { countryId: parseInt(countryId, 10), userCountryId };
      
      // Try to get from cache first
      const cachedClients = await this.dataCacheService.getCachedClientsList(pageNum, limitNum, filters);
      if (cachedClients) {
        this.logger.log(`Country clients served from cache for page ${pageNum}`);
        return {
          success: true,
          data: cachedClients,
          fromCache: true,
          pagination: {
            page: pageNum,
            limit: limitNum,
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Check database connectivity before fetching
      const isConnected = await this.databaseResilienceService.testConnection();
      if (!isConnected) {
        throw new HttpException('Database connection unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      }

      // If not in cache, fetch from database
      this.logger.log(`Fetching country clients from database for page ${pageNum}`);
      const clients = await this.clientsService.findByCountry(+countryId, userCountryId);
      
      // Cache the result
      await this.dataCacheService.cacheClientsList(pageNum, limitNum, clients, filters);
      
      return {
        success: true,
        data: clients,
        fromCache: false,
        pagination: {
          page: pageNum,
          limit: limitNum,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching country clients:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      return {
        success: false,
        error: 'Failed to fetch country clients',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Invalidate clients cache (admin endpoint)
   */
  @Get('cache/invalidate')
  async invalidateClientsCache() {
    try {
      await this.dataCacheService.invalidateClientsCache();
      this.logger.log('Clients cache invalidated successfully');
      return {
        success: true,
        message: 'Clients cache invalidated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error invalidating clients cache:', error);
      return {
        success: false,
        error: 'Failed to invalidate clients cache',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
