import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductReturnsService } from './product-returns.service';
import { CreateProductReturnDto } from './dto/create-product-return.dto';
import { UpdateProductReturnDto } from './dto/update-product-return.dto';
import { UpdateReturnStatusDto } from './dto/return-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('product-returns')
@UseGuards(JwtAuthGuard)
export class ProductReturnsController {
  constructor(private readonly productReturnsService: ProductReturnsService) {}

  @Post()
  create(@Body() createProductReturnDto: CreateProductReturnDto) {
    return this.productReturnsService.create(createProductReturnDto);
  }

  @Get()
  findAll() {
    return this.productReturnsService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.productReturnsService.getReturnStats();
  }

  @Get('salesrep/:salesrepId')
  findBySalesRep(@Param('salesrepId', ParseIntPipe) salesrepId: number) {
    return this.productReturnsService.findBySalesRep(salesrepId);
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.productReturnsService.findByClient(clientId);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.productReturnsService.getReturnsByProduct(productId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.productReturnsService.findByStatus(status);
  }

  @Get('date-range')
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.productReturnsService.findByDateRange(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productReturnsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductReturnDto: UpdateProductReturnDto,
  ) {
    return this.productReturnsService.update(id, updateProductReturnDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateReturnStatusDto,
  ) {
    return this.productReturnsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productReturnsService.remove(id);
  }
}
