import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    // Debug logging
    console.log('🔍 Received order data:', JSON.stringify(createOrderDto, null, 2));
    
    // Extract salesrep ID from JWT token
    const salesrepId = req.user?.sub || req.user?.id;
    
    // Get sales rep name from database
    let salesrepName = 'Unknown Sales Rep';
    try {
      const salesRep = await this.usersService.findById(salesrepId);
      if (salesRep) {
        salesrepName = salesRep.name;
      }
    } catch (error) {
      console.error('❌ Error fetching sales rep name:', error);
    }
    
    const result = await this.ordersService.create(createOrderDto, salesrepId, salesrepName);
    
    // Return in format expected by Flutter app
    return {
      success: true,
      data: result.order,
      warning: result.creditLimitWarning
    };
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Extract salesrep ID from JWT token
    const salesrepId = req.user?.sub || req.user?.id;
    
    if (!salesrepId) {
      return {
        success: false,
        message: 'Sales representative ID not found in token',
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Build filters object
    const filters: any = {
      page: pageNum,
      limit: limitNum,
    };

    if (status) filters.status = status;
    if (clientId) filters.clientId = parseInt(clientId, 10);
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    const result = await this.ordersService.findAll(salesrepId, filters);
    
    // Return in format expected by Flutter app
    return {
      success: true,
      data: result.orders,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    // Extract salesrep ID from JWT token
    const salesrepId = req.user?.sub || req.user?.id;
    
    if (!salesrepId) {
      return {
        success: false,
        message: 'Sales representative ID not found in token',
        data: null
      };
    }

    const order = await this.ordersService.findOne(+id, salesrepId);
    
    if (!order) {
      return {
        success: false,
        message: 'Order not found or access denied',
        data: null
      };
    }
    
    // Return in format expected by Flutter app
    return {
      success: true,
      data: order
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOrderDto: Partial<CreateOrderDto>) {
    const order = await this.ordersService.update(+id, updateOrderDto);
    
    // Return in format expected by Flutter app
    return {
      success: true,
      data: order
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
} 