import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: 'Niaje! 🚀 API is running smoothly',
      status: 'online',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth',
        clients: '/api/clients',
        products: '/api/products',
        orders: '/api/orders',
        analytics: '/api/analytics',
        health: '/api/health'
      },
      documentation: 'Check the server_doc folder for API documentation'
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      message: 'API is running perfectly! 💪',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}
