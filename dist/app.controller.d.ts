import { Response } from 'express';
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
            ping: string;
        };
        documentation: string;
    };
    getHealth(): {
        status: string;
        message: string;
        timestamp: string;
        uptime: number;
    };
    getPing(): {
        status: string;
        message: string;
        timestamp: string;
        uptime: number;
    };
    getFavicon(res: Response): void;
    getFaviconPng(res: Response): void;
}
