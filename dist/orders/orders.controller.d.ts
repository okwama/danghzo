import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UsersService } from '../users/users.service';
export declare class OrdersController {
    private readonly ordersService;
    private readonly usersService;
    constructor(ordersService: OrdersService, usersService: UsersService);
    create(createOrderDto: CreateOrderDto, req: any): Promise<{
        success: boolean;
        data: import("./entities/order.entity").Order;
        warning: any;
    }>;
    findAll(req: any, page?: string, limit?: string, status?: string, clientId?: string, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        message: string;
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    } | {
        success: boolean;
        data: import("./entities/order.entity").Order[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        message?: undefined;
    }>;
    findOne(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    } | {
        success: boolean;
        data: import("./entities/order.entity").Order;
        message?: undefined;
    }>;
    update(id: string, updateOrderDto: Partial<CreateOrderDto>): Promise<{
        success: boolean;
        data: import("./entities/order.entity").Order;
    }>;
    remove(id: string): Promise<void>;
}
