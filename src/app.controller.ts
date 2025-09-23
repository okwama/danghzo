import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller()
export class AppController {
  @Get()
  @UseGuards(JwtAuthGuard)
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
        health: '/api/health',
        ping: '/api/ping'
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

  @Get('ping')
  getPing() {
    return {
      status: 'pong',
      message: 'API is alive! 🏓',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  @Get('favicon.ico')
  getFavicon(@Res() res: Response) {
    res.status(204).send(); // No content for favicon
  }

  @Get('favicon.png')
  getFaviconPng(@Res() res: Response) {
    res.status(204).send(); // No content for favicon
  }
}
