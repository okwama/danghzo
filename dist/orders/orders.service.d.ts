import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private orderRepository;
    private orderItemRepository;
    private dataSource;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, dataSource: DataSource);
    create(createOrderDto: CreateOrderDto, salesrepId?: number, salesrepName?: string): Promise<{
        order: Order;
        creditLimitWarning: any;
    }>;
    private generateSoNumber;
    findAll(salesrepId?: number, filters?: {
        status?: string;
        clientId?: number;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        orders: Order[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number, salesrepId?: number): Promise<Order | null>;
    findAllAdmin(filters?: {
        status?: string;
        clientId?: number;
        salesrepId?: number;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        orders: Order[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    update(id: number, updateOrderDto: Partial<CreateOrderDto>): Promise<Order | null>;
    remove(id: number): Promise<void>;
}
