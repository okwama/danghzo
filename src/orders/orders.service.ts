import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Clients } from '../entities/clients.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, salesrepId?: number, salesrepName?: string): Promise<{ order: Order; creditLimitWarning: any }> {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Check credit limit before creating order
        const client = await queryRunner.manager.findOne(Clients, {
          where: { id: createOrderDto.clientId },
          select: ['id', 'name', 'balance', 'credit_limit']
        });

        if (!client) {
          throw new Error('Client not found');
        }

        // Generate SO number if not provided
        const soNumber = createOrderDto.soNumber || await this.generateSoNumber();
        
        // Calculate totals from order items (tax-inclusive prices)
        let subtotal = 0;
        let taxAmount = 0;
        let totalAmount = 0;
        let netPrice = 0;

        // Calculate totals from order items
        for (const item of createOrderDto.orderItems) {
          const itemUnitPrice = item.unitPrice || 0;
          const itemQuantity = item.quantity || 0;
          const itemTotal = itemUnitPrice * itemQuantity; // This is tax-inclusive total
          
          // Calculate tax amount from tax-inclusive price (16% VAT)
          // Formula: Tax = Total / (1 + 0.16) * 0.16
          const itemTax = item.taxAmount || (itemTotal / 1.16 * 0.16);
          const itemSubtotal = itemTotal - itemTax; // Extract subtotal from tax-inclusive price
          
          subtotal += itemSubtotal;
          taxAmount += itemTax;
          totalAmount += itemTotal; // This remains the same (tax-inclusive)
          netPrice += itemTotal; // Net price is the same as total for tax-inclusive
        }

        // Check credit limit
        const currentBalance = Number(client.balance) || 0;
        const creditLimit = Number(client.credit_limit) || 0;
        const newBalance = currentBalance + totalAmount;
        
        let creditLimitWarning = null;
        if (newBalance > creditLimit && creditLimit > 0) {
          creditLimitWarning = {
            currentBalance,
            creditLimit,
            orderAmount: totalAmount,
            newBalance,
            exceedsBy: newBalance - creditLimit
          };
          console.log(`⚠️ Credit limit exceeded for client ${client.name}: Current: ${currentBalance}, Limit: ${creditLimit}, New Balance: ${newBalance}`);
        }

        // Create the order
        const orderData = {
          soNumber: soNumber,
          clientId: createOrderDto.clientId,
          orderDate: createOrderDto.orderDate ? new Date(createOrderDto.orderDate) : new Date(),
          expectedDeliveryDate: createOrderDto.expectedDeliveryDate ? new Date(createOrderDto.expectedDeliveryDate) : null,
          subtotal: subtotal,
          taxAmount: taxAmount,
          totalAmount: totalAmount,
          netPrice: netPrice,
          notes: createOrderDto.comment || createOrderDto.notes,
          createdBy: salesrepName, // Sales rep name who created the order
          salesrep: salesrepId, // Sales rep ID assigned to this client
          riderId: createOrderDto.riderId,
          status: createOrderDto.status || 'draft',
          myStatus: createOrderDto.myStatus || 0,
        };

        const newOrder = this.orderRepository.create(orderData);
        const savedOrder = await queryRunner.manager.save(newOrder);

        // Create order items
        for (const itemDto of createOrderDto.orderItems) {
          const itemUnitPrice = itemDto.unitPrice || 0;
          const itemQuantity = itemDto.quantity || 0;
          const itemTotal = itemUnitPrice * itemQuantity; // Tax-inclusive total
          
          // Calculate tax amount from tax-inclusive price (16% VAT)
          const itemTax = itemDto.taxAmount || (itemTotal / 1.16 * 0.16);
          const itemSubtotal = itemTotal - itemTax; // Extract subtotal from tax-inclusive price

          const orderItemData = {
            salesOrderId: savedOrder.id,
            productId: itemDto.productId,
            quantity: itemQuantity,
            unitPrice: itemUnitPrice,
            taxAmount: itemTax,
            totalPrice: itemTotal, // This is tax-inclusive
            taxType: itemDto.taxType || '16%',
            netPrice: itemTotal, // Net price is same as total for tax-inclusive
            shippedQuantity: itemDto.shippedQuantity || 0,
          };

          const orderItem = this.orderItemRepository.create(orderItemData);
          await queryRunner.manager.save(orderItem);
        }

        await queryRunner.commitTransaction();
        await queryRunner.release();

        // Return the order with items and credit limit warning
        const createdOrder = await this.findOne(savedOrder.id);
        return {
          order: createdOrder,
          creditLimitWarning
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        
        // Check if it's a duplicate key error
        if (error.message && error.message.includes('Duplicate entry') && error.message.includes('so_number')) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw new Error(`Failed to create order after ${maxRetries} retries due to SO number conflicts`);
          }
          // Wait a bit before retrying to avoid immediate conflicts
          await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
          continue;
        }
        
        throw error;
      }
    }
    
    throw new Error('Failed to create order after maximum retries');
  }

  private async generateSoNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    
    // Get the latest SO number for the current year
    const latestOrder = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.soNumber LIKE :pattern', { pattern: `SO-${currentYear}-%` })
      .orderBy('order.soNumber', 'DESC')
      .getOne();
    
    let nextNumber = 1;
    
    if (latestOrder && latestOrder.soNumber) {
      const parts = latestOrder.soNumber.split('-');
      if (parts.length >= 3) {
        const yearPart = parts[1];
        const numberPart = parts[2];
        
        // Only increment if it's the same year
        if (yearPart === currentYear.toString()) {
          const lastNumber = parseInt(numberPart);
          if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
          }
        }
        // If it's a different year, start from 1
      }
    }
    
    return `SO-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
  }

  async findAll(salesrepId?: number, filters?: {
    status?: string;
    clientId?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number }> {
    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.client', 'client')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product');

    // Filter by sales representative (required for security)
    if (salesrepId) {
      query.where('order.salesrep = :salesrepId', { salesrepId });
    } else {
      // If no salesrepId provided, return empty result for security
      return {
        orders: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };
    }

    // Apply additional filters
    if (filters?.status) {
      query.andWhere('order.status = :status', { status: filters.status });
    }

    if (filters?.clientId) {
      query.andWhere('order.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters?.startDate) {
      query.andWhere('order.orderDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('order.orderDate <= :endDate', { endDate: filters.endDate });
    }

    // Get total count for pagination
    const total = await query.getCount();

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    query.orderBy('order.createdAt', 'DESC')
         .skip(offset)
         .take(limit);

    const orders = await query.getMany();

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: number, salesrepId?: number): Promise<Order | null> {
    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.client', 'client')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .where('order.id = :id', { id });

    // If salesrepId is provided, ensure user can only access their own orders
    if (salesrepId) {
      query.andWhere('order.salesrep = :salesrepId', { salesrepId });
    }

    return query.getOne();
  }

  // Admin method to find all orders (for admin users)
  async findAllAdmin(filters?: {
    status?: string;
    clientId?: number;
    salesrepId?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number }> {
    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.client', 'client')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product');

    // Apply filters
    if (filters?.status) {
      query.where('order.status = :status', { status: filters.status });
    }

    if (filters?.clientId) {
      query.andWhere('order.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters?.salesrepId) {
      query.andWhere('order.salesrep = :salesrepId', { salesrepId: filters.salesrepId });
    }

    if (filters?.startDate) {
      query.andWhere('order.orderDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('order.orderDate <= :endDate', { endDate: filters.endDate });
    }

    // Get total count for pagination
    const total = await query.getCount();

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    query.orderBy('order.createdAt', 'DESC')
         .skip(offset)
         .take(limit);

    const orders = await query.getMany();

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async update(id: number, updateOrderDto: Partial<CreateOrderDto>): Promise<Order | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the existing order
      const existingOrder = await this.findOne(id);
      if (!existingOrder) {
        throw new Error('Order not found');
      }

      // Update order items if provided
      if (updateOrderDto.orderItems && updateOrderDto.orderItems.length > 0) {
        // Delete existing order items
        await queryRunner.manager.delete(OrderItem, { salesOrderId: id });

        // Calculate new totals (tax-inclusive prices)
        let subtotal = 0;
        let taxAmount = 0;
        let totalAmount = 0;
        let netPrice = 0;

        // Create new order items
        for (const itemDto of updateOrderDto.orderItems) {
          const itemUnitPrice = itemDto.unitPrice || 0;
          const itemQuantity = itemDto.quantity || 0;
          const itemTotal = itemUnitPrice * itemQuantity; // Tax-inclusive total
          
          // Calculate tax amount from tax-inclusive price (16% VAT)
          const itemTax = itemDto.taxAmount || (itemTotal / 1.16 * 0.16);
          const itemSubtotal = itemTotal - itemTax; // Extract subtotal from tax-inclusive price

          const orderItemData = {
            salesOrderId: id,
            productId: itemDto.productId,
            quantity: itemQuantity,
            unitPrice: itemUnitPrice,
            taxAmount: itemTax,
            totalPrice: itemTotal, // This is tax-inclusive
            taxType: itemDto.taxType || '16%',
            netPrice: itemTotal, // Net price is same as total for tax-inclusive
            shippedQuantity: itemDto.shippedQuantity || 0,
          };

          const orderItem = this.orderItemRepository.create(orderItemData);
          await queryRunner.manager.save(orderItem);

          subtotal += itemSubtotal;
          taxAmount += itemTax;
          totalAmount += itemTotal; // This remains the same (tax-inclusive)
          netPrice += itemTotal; // Net price is the same as total for tax-inclusive
        }

        // Update order totals
        await queryRunner.manager.update(Order, id, {
          subtotal: subtotal,
          taxAmount: taxAmount,
          totalAmount: totalAmount,
          netPrice: netPrice,
          notes: updateOrderDto.comment || updateOrderDto.notes,
        });
      } else {
        // Update only order fields if no items provided
        const updateData: any = {};
        if (updateOrderDto.comment !== undefined) updateData.notes = updateOrderDto.comment;
        if (updateOrderDto.notes !== undefined) updateData.notes = updateOrderDto.notes;
        if (updateOrderDto.status !== undefined) updateData.status = updateOrderDto.status;
        
        if (Object.keys(updateData).length > 0) {
          await queryRunner.manager.update(Order, id, updateData);
        }
      }

      await queryRunner.commitTransaction();

      // Return the updated order
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    await this.orderRepository.delete(id);
  }
} 
