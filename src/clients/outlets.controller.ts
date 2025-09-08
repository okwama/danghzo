import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('outlets')
@UseGuards(JwtAuthGuard)
export class OutletsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get(':id')
  async getOutlet(@Param('id') id: string, @Request() req) {
    const client = await this.clientsService.findOne(+id, req.user.countryId);
    
    if (!client) {
      return null;
    }

    // Apply fallback coordinates if needed
    if (client.latitude === null || client.longitude === null) {
      const fallbackCoordinates = this.getFallbackCoordinates(client.countryId || 1);
      console.log(`⚠️ Client ${client.id} has null coordinates, using fallback:`, fallbackCoordinates);
      client.latitude = fallbackCoordinates.latitude;
      client.longitude = fallbackCoordinates.longitude;
    }

    // Transform response to match Flutter's expected Client model
    return {
      id: client.id,
      name: client.name,
      address: client.address,
      contact: client.contact,
      email: client.email,
      latitude: client.latitude,
      longitude: client.longitude,
      regionId: client.region_id,
      region: client.region,
      countryId: client.countryId,
      status: client.status,
      taxPin: client.tax_pin,
      location: client.location,
      clientType: client.client_type,
      outletAccount: client.outlet_account,
      balance: client.balance,
      createdAt: client.created_at,
    };
  }

  @Post()
  async createOutlet(@Body() body: any, @Request() req) {
    // Transform snake_case to camelCase for compatibility
    const createClientDto: CreateClientDto = {
      name: body.name,
      address: body.address,
      taxPin: body.tax_pin,
      email: body.email,
      contact: body.contact,
      latitude: body.latitude,
      longitude: body.longitude,
      location: body.location,
      clientType: body.client_type,
      regionId: body.region_id,
      region: body.region,
      routeId: body.route_id,
      routeName: body.route_name,
      routeIdUpdate: body.route_id_update,
      routeNameUpdate: body.route_name_update,
      balance: body.balance,
      outletAccount: body.outlet_account,
      countryId: body.country || req.user.countryId,
      addedBy: req.user.id,
    };

    const client = await this.clientsService.create(createClientDto, req.user.countryId, req.user.id);
    
    // Transform response to match Flutter's expected Client model
    return {
      id: client.id,
      name: client.name,
      address: client.address,
      contact: client.contact,
      email: client.email,
      latitude: client.latitude,
      longitude: client.longitude,
      regionId: client.region_id,
      region: client.region,
      countryId: client.countryId,
      status: client.status,
      taxPin: client.tax_pin,
      location: client.location,
      clientType: client.client_type,
      outletAccount: client.outlet_account,
      balance: client.balance,
      createdAt: client.created_at,
    };
  }

  // Helper method to provide fallback coordinates
  private getFallbackCoordinates(countryId: number): { latitude: number; longitude: number } {
    // Default coordinates for different countries
    const countryCoordinates: { [key: number]: { latitude: number; longitude: number } } = {
      1: { latitude: -1.300897837533575, longitude: 36.777742335574864 }, // Kenya (Nairobi)
      2: { latitude: -6.8235, longitude: 39.2695 }, // Tanzania (Dar es Salaam)
      3: { latitude: 0.3476, longitude: 32.5825 }, // Uganda (Kampala)
      4: { latitude: -1.9441, longitude: 30.0619 }, // Rwanda (Kigali)
      5: { latitude: -3.3731, longitude: 29.9189 }, // Burundi (Bujumbura)
    };

    return countryCoordinates[countryId] || countryCoordinates[1]; // Default to Kenya
  }
} 