import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { SearchClientsDto } from './dto/search-clients.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto, @Request() req) {
    const userCountryId = req.user.countryId;
    return this.clientsService.create(createClientDto, userCountryId);
  }

  @Get()
  async findAll(@Request() req) {
    const userCountryId = req.user.countryId;
    const userId = req.user.id;
    return this.clientsService.findAll(userCountryId, userId);
  }

  @Get('basic')
  async findAllBasic(@Request() req) {
    const userCountryId = req.user.countryId;
    const userId = req.user.id;
    return this.clientsService.findAll(userCountryId, userId); // Uses select fields
  }

  @Get('search')
  async search(@Query() searchDto: SearchClientsDto, @Request() req) {
    const userCountryId = req.user.countryId;
    return this.clientsService.search(searchDto, userCountryId);
  }

  @Get('search/basic')
  async searchBasic(@Query() searchDto: SearchClientsDto, @Request() req) {
    const userCountryId = req.user.countryId;
    return this.clientsService.search(searchDto, userCountryId); // Uses select fields
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userCountryId = req.user.countryId;
    return this.clientsService.findOne(+id, userCountryId);
  }

  @Get(':id/basic')
  async findOneBasic(@Param('id') id: string, @Request() req) {
    const userCountryId = req.user.countryId;
    return this.clientsService.findOneBasic(+id, userCountryId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateClientDto: Partial<CreateClientDto>, @Request() req) {
    const userCountryId = req.user.countryId;
    return this.clientsService.update(+id, updateClientDto, userCountryId);
  }

  // Remove delete endpoint for sales reps
  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return this.clientsService.remove(+id);
  // }

  @Get('country/:countryId')
  async findByCountry(@Param('countryId') countryId: string, @Request() req) {
    const userCountryId = req.user.countryId;
    return this.clientsService.findByCountry(+countryId, userCountryId);
  }

  @Get('region/:regionId')
  async findByRegion(@Param('regionId') regionId: string, @Request() req) {
    const userCountryId = req.user.countryId;
    return this.clientsService.findByRegion(+regionId, userCountryId);
  }

  @Get('route/:routeId')
  async findByRoute(@Param('routeId') routeId: string, @Request() req) {
    const userCountryId = req.user.countryId;
    return this.clientsService.findByRoute(+routeId, userCountryId);
  }

  @Get('location/nearby')
  async findByLocation(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius: string,
    @Request() req
  ) {
    const userCountryId = req.user.countryId;
    return this.clientsService.findByLocation(
      +latitude,
      +longitude,
      radius ? +radius : 10,
      userCountryId
    );
  }

  @Get('stats/overview')
  async getClientStats(@Query('regionId') regionId: string, @Request() req) {
    const userCountryId = req.user.countryId;
    return this.clientsService.getClientStats(userCountryId, regionId ? +regionId : undefined);
  }
} 