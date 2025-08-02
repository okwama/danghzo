import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  async findAll() {
    try {
      console.log('📦 Products API: GET /products called');
      const products = await this.productsService.findAll();
      console.log(`📦 Products API: Returning ${products.length} products`);
      return products;
    } catch (error) {
      console.error('❌ Products API Error:', error);
      throw error;
    }
  }

  @Get('country/:countryId')
  @UseGuards(JwtAuthGuard)
  async findProductsByCountry(@Param('countryId') countryId: string) {
    try {
      console.log(`🌍 Products API: GET /products/country/${countryId} called`);
      const userCountryId = parseInt(countryId);
      
      if (isNaN(userCountryId)) {
        throw new Error('Invalid country ID');
      }

      const products = await this.productsService.findProductsByCountry(userCountryId);
      console.log(`🌍 Products API: Returning ${products.length} products for country ${userCountryId}`);
      return products;
    } catch (error) {
      console.error('❌ Products API Error:', error);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }
}

// Separate controller for health checks without authentication
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Get('products')
  async productsHealthCheck() {
    try {
      console.log('🏥 Products Health Check: Testing database connection...');
      const result = await this.dataSource.query('SELECT 1 as test');
      console.log('✅ Database connection successful:', result);
      return { status: 'healthy', database: 'connected', timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return { status: 'unhealthy', database: 'disconnected', error: error.message, timestamp: new Date().toISOString() };
    }
  }
} 