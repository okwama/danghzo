import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    // Handle database connection errors
    if (exception instanceof QueryFailedError) {
      this.logger.error(`Database query failed: ${exception.message}`);
      
      // Check for specific database errors
      if (exception.message.includes('ECONNRESET') || 
          exception.message.includes('Connection lost') ||
          exception.message.includes('MySQL server has gone away')) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database connection lost. Please try again.';
        errorCode = 'DATABASE_CONNECTION_LOST';
      } else if (exception.message.includes('ETIMEDOUT') || 
                 exception.message.includes('Connection timeout')) {
        status = HttpStatus.REQUEST_TIMEOUT;
        message = 'Database request timeout. Please try again.';
        errorCode = 'DATABASE_TIMEOUT';
      } else if (exception.message.includes('Unknown column')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid query parameters.';
        errorCode = 'INVALID_QUERY';
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database error occurred.';
        errorCode = 'DATABASE_ERROR';
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || exception.message;
      errorCode = (exceptionResponse as any).error || 'HTTP_ERROR';
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
      
      // Check for common connection errors
      if (exception.message.includes('ECONNRESET') || 
          exception.message.includes('Connection lost') ||
          exception.message.includes('MySQL server has gone away')) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database connection lost. Please try again.';
        errorCode = 'DATABASE_CONNECTION_LOST';
      } else {
        message = 'An unexpected error occurred.';
        errorCode = 'UNEXPECTED_ERROR';
      }
    }

    // Log the error with request context
    this.logger.error(
      `Error ${status} on ${request.method} ${request.url}: ${message}`,
      {
        error: exception,
        request: {
          method: request.method,
          url: request.url,
          userAgent: request.get('User-Agent'),
          ip: request.ip,
        },
      }
    );

    // Send error response
    response.status(status).json({
      statusCode: status,
      error: errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
