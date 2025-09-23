import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const endpoint = request.url;
    
    if (err || !user) {
      // Customize error message based on the endpoint
      let message = 'Authentication required to access this resource';
      
      if (info?.name === 'TokenExpiredError') {
        message = 'Your session has expired. Please log in again.';
      } else if (info?.name === 'JsonWebTokenError') {
        message = 'Invalid authentication token. Please log in again.';
      } else if (info?.name === 'NotBeforeError') {
        message = 'Authentication token is not yet valid.';
      } else if (endpoint.includes('/products')) {
        message = 'Please log in to view products and make purchases.';
      } else if (endpoint.includes('/clients')) {
        message = 'Please log in to access client information.';
      } else if (endpoint.includes('/orders')) {
        message = 'Please log in to view your orders.';
      } else if (endpoint.includes('/dashboard')) {
        message = 'Please log in to access your dashboard.';
      } else if (endpoint.includes('/profile')) {
        message = 'Please log in to view your profile.';
      }
      
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'AUTHENTICATION_REQUIRED',
        message,
        timestamp: new Date().toISOString(),
        path: endpoint,
        hint: 'Include a valid JWT token in the Authorization header: Bearer <your-token>'
      });
    }
    
    return user;
  }
} 