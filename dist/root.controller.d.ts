import { Response } from 'express';
export declare class RootController {
    getRoot(): {
        message: string;
        status: string;
        version: string;
        timestamp: string;
        info: string;
        endpoints: {
            api: string;
            health: string;
            ping: string;
        };
    };
    getFavicon(res: Response): void;
    getFaviconPng(res: Response): void;
}
