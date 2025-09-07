export declare class AppController {
    getRoot(): {
        message: string;
        status: string;
        version: string;
        timestamp: string;
        endpoints: {
            auth: string;
            clients: string;
            products: string;
            orders: string;
            analytics: string;
            health: string;
        };
        documentation: string;
    };
    getHealth(): {
        status: string;
        message: string;
        timestamp: string;
        uptime: number;
    };
}
