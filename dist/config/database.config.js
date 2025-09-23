"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const sales_rep_entity_1 = require("../entities/sales-rep.entity");
const clients_entity_1 = require("../entities/clients.entity");
const product_entity_1 = require("../products/entities/product.entity");
const journey_plan_entity_1 = require("../journey-plans/entities/journey-plan.entity");
const login_history_entity_1 = require("../entities/login-history.entity");
const uplift_sale_entity_1 = require("../entities/uplift-sale.entity");
const uplift_sale_item_entity_1 = require("../entities/uplift-sale-item.entity");
const task_entity_1 = require("../entities/task.entity");
const leave_entity_1 = require("../entities/leave.entity");
const store_entity_1 = require("../entities/store.entity");
const store_inventory_entity_1 = require("../entities/store-inventory.entity");
const category_entity_1 = require("../entities/category.entity");
const category_price_option_entity_1 = require("../entities/category-price-option.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const order_item_entity_1 = require("../orders/entities/order-item.entity");
const users_entity_1 = require("../users/entities/users.entity");
const notice_entity_1 = require("../notices/entities/notice.entity");
const leave_type_entity_1 = require("../entities/leave-type.entity");
const feedback_report_entity_1 = require("../entities/feedback-report.entity");
const product_report_entity_1 = require("../entities/product-report.entity");
const visibility_report_entity_1 = require("../entities/visibility-report.entity");
const sales_client_payment_entity_1 = require("../entities/sales-client-payment.entity");
const product_return_entity_1 = require("../product-returns/entities/product-return.entity");
const getDatabaseConfig = (configService) => {
    const useLocalDb = configService.get('USE_LOCAL_DB', 'false') === 'true';
    const isProduction = configService.get('NODE_ENV', 'development') === 'production';
    const baseConfig = {
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [
            sales_rep_entity_1.SalesRep, clients_entity_1.Clients, product_entity_1.Product, journey_plan_entity_1.JourneyPlan, login_history_entity_1.LoginHistory, uplift_sale_entity_1.UpliftSale, uplift_sale_item_entity_1.UpliftSaleItem,
            task_entity_1.Task, leave_entity_1.Leave, store_entity_1.Store, store_inventory_entity_1.StoreInventory, category_entity_1.Category, category_price_option_entity_1.CategoryPriceOption, order_entity_1.Order, order_item_entity_1.OrderItem, users_entity_1.Users, notice_entity_1.Notice, leave_type_entity_1.LeaveType,
            feedback_report_entity_1.FeedbackReport, product_report_entity_1.ProductReport, visibility_report_entity_1.VisibilityReport, sales_client_payment_entity_1.SalesClientPayment, product_return_entity_1.ProductReturn,
        ],
        synchronize: false,
        logging: configService.get('DB_LOGGING', false),
        charset: 'utf8mb4',
        ssl: configService.get('DB_SSL', false),
        extra: {
            connectionLimit: 25,
            charset: 'utf8mb4',
            multipleStatements: true,
            dateStrings: true,
            acquireTimeout: 60000,
            timeout: 60000,
            waitForConnections: true,
            queueLimit: 0,
            keepAliveInitialDelay: 10000,
            enableKeepAlive: true,
            supportBigNumbers: true,
            bigNumberStrings: true,
            flags: ['-FOUND_ROWS'],
            validateConnection: true,
        },
        retryAttempts: 10,
        retryDelay: 3000,
        connectTimeout: 60000,
        acquireTimeout: 60000,
        timeout: 60000,
        keepConnectionAlive: true,
        autoLoadEntities: true,
        maxQueryExecutionTime: 30000,
        cache: {
            duration: 30000,
        },
    };
    if (isProduction) {
        console.log('🚀 Production environment - using MySQL database with enhanced resilience');
        return {
            ...baseConfig,
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT', 3306),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
        };
    }
    console.log('🔧 Development environment - using MySQL database with enhanced resilience');
    return {
        ...baseConfig,
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'impulsep_moonsun'),
    };
};
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map