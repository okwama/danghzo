import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpliftSalesService } from './uplift-sales.service';
import { CreateUpliftSaleDto } from './dto/create-uplift-sale.dto';
import { UpdateUpliftSaleDto } from './dto/update-uplift-sale.dto';

@Controller('uplift-sales')
@UseGuards(JwtAuthGuard)
export class UpliftSalesController {
  constructor(private readonly upliftSalesService: UpliftSalesService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.upliftSalesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.upliftSalesService.findOne(+id);
  }

  @Post()
  async create(@Body() createUpliftSaleDto: CreateUpliftSaleDto, @Request() req) {
    console.log('🔍 UpliftSalesController: Received POST request with body:', JSON.stringify(createUpliftSaleDto, null, 2));
    console.log('🔍 UpliftSalesController: User from JWT:', req.user);
    
    // Extract userId from JWT token
    const userId = req.user.id;
    console.log('🔍 UpliftSalesController: Extracted userId from JWT:', userId);
    
    return this.upliftSalesService.create(createUpliftSaleDto, userId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUpliftSaleDto: UpdateUpliftSaleDto) {
    return this.upliftSalesService.update(+id, updateUpliftSaleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.upliftSalesService.remove(+id);
  }
} 