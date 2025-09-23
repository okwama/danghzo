import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SalesRep } from '../entities/sales-rep.entity';
import { Clients } from '../entities/clients.entity';
import { Product } from '../products/entities/product.entity';
import { JourneyPlan } from '../journey-plans/entities/journey-plan.entity';
import { LoginHistory } from '../entities/login-history.entity';
import { UpliftSale } from '../entities/uplift-sale.entity';
import { UpliftSaleItem } from '../entities/uplift-sale-item.entity';
import { Task } from '../entities/task.entity';
import { Leave } from '../entities/leave.entity';
import { Store } from '../entities/store.entity';
import { StoreInventory } from '../entities/store-inventory.entity';
import { Category } from '../entities/category.entity';
import { CategoryPriceOption } from '../entities/category-price-option.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Users } from '../users/entities/users.entity';
import { Notice } from '../notices/entities/notice.entity';
import { LeaveType } from '../entities/leave-type.entity';
import { FeedbackReport } from '../entities/feedback-report.entity';
import { ProductReport } from '../entities/product-report.entity';
import { VisibilityReport } from '../entities/visibility-report.entity';
import { SalesClientPayment } from '../entities/sales-client-payment.entity';
import { ProductReturn } from '../product-returns/entities/product-return.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const useLocalDb = configService.get<string>('USE_LOCAL_DB', 'false') === 'true';
  const isProduction = configService.get<string>('NODE_ENV', 'development') === 'production';

  // Enhanced database configuration with better timeout handling
  const baseConfig = {
    type: 'mysql' as const,
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [
      SalesRep, Clients, Product, JourneyPlan, LoginHistory, UpliftSale, UpliftSaleItem,
      Task, Leave, Store, StoreInventory, Category, CategoryPriceOption, Order, OrderItem, Users, Notice, LeaveType,
      FeedbackReport, ProductReport, VisibilityReport, SalesClientPayment, ProductReturn,
    ],
    synchronize: false,
    logging: configService.get<boolean>('DB_LOGGING', false),
    charset: 'utf8mb4',
    ssl: configService.get<boolean>('DB_SSL', false),
    // Enhanced connection settings
    extra: {
      connectionLimit: 25, // Increased connection limit
      charset: 'utf8mb4',
      multipleStatements: true,
      dateStrings: true,
      // MySQL2 specific timeout settings
      acquireTimeout: 60000, // 60 seconds to acquire connection
      timeout: 60000, // 60 seconds query timeout
      // Connection pool settings
      waitForConnections: true,
      queueLimit: 0, // No limit on queue
      // Keep alive settings
      keepAliveInitialDelay: 10000, // 10 seconds
      enableKeepAlive: true,
      // Connection reset handling
      supportBigNumbers: true,
      bigNumberStrings: true,
      // Improved connection handling
      flags: ['-FOUND_ROWS'],
      // Connection validation
      validateConnection: true,
      // Retry settings
      maxReconnects: 10,
      reconnectInterval: 2000,
    },
    // TypeORM retry settings
    retryAttempts: 10, // Increased retry attempts
    retryDelay: 3000, // 3 seconds between retries
    connectTimeout: 60000, // 60 seconds connection timeout
    acquireTimeout: 60000, // 60 seconds acquire timeout
    timeout: 60000, // 60 seconds query timeout
    keepConnectionAlive: true,
    autoLoadEntities: true,
    // Additional resilience settings
    maxQueryExecutionTime: 30000, // 30 seconds max query execution
    cache: {
      duration: 30000, // 30 seconds cache duration
    },
  };

  // Production configuration
  if (isProduction) {
    console.log('🚀 Production environment - using MySQL database with enhanced resilience');
    return {
      ...baseConfig,
      host: configService.get<string>('DB_HOST'),
      port: configService.get<number>('DB_PORT', 3306),
      username: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_DATABASE'),
    };
  }

  // Development configuration
  console.log('🔧 Development environment - using MySQL database with enhanced resilience');
  return {
    ...baseConfig,
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get<string>('DB_USERNAME', 'root'),
    password: configService.get<string>('DB_PASSWORD', ''),
    database: configService.get<string>('DB_DATABASE', 'impulsep_moonsun'),
  };
}; 