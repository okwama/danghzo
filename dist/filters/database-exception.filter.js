"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let DatabaseExceptionFilter = DatabaseExceptionFilter_1 = class DatabaseExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(DatabaseExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errorCode = 'INTERNAL_ERROR';
        if (exception instanceof typeorm_1.QueryFailedError) {
            this.logger.error(`Database query failed: ${exception.message}`);
            if (exception.message.includes('ECONNRESET') ||
                exception.message.includes('Connection lost') ||
                exception.message.includes('MySQL server has gone away')) {
                status = common_1.HttpStatus.SERVICE_UNAVAILABLE;
                message = 'Database connection lost. Please try again.';
                errorCode = 'DATABASE_CONNECTION_LOST';
            }
            else if (exception.message.includes('ETIMEDOUT') ||
                exception.message.includes('Connection timeout')) {
                status = common_1.HttpStatus.REQUEST_TIMEOUT;
                message = 'Database request timeout. Please try again.';
                errorCode = 'DATABASE_TIMEOUT';
            }
            else if (exception.message.includes('Unknown column')) {
                status = common_1.HttpStatus.BAD_REQUEST;
                message = 'Invalid query parameters.';
                errorCode = 'INVALID_QUERY';
            }
            else {
                status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
                message = 'Database error occurred.';
                errorCode = 'DATABASE_ERROR';
            }
        }
        else if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message = typeof exceptionResponse === 'string'
                ? exceptionResponse
                : exceptionResponse.message || exception.message;
            errorCode = exceptionResponse.error || 'HTTP_ERROR';
        }
        else if (exception instanceof Error) {
            this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
            if (exception.message.includes('ECONNRESET') ||
                exception.message.includes('Connection lost') ||
                exception.message.includes('MySQL server has gone away')) {
                status = common_1.HttpStatus.SERVICE_UNAVAILABLE;
                message = 'Database connection lost. Please try again.';
                errorCode = 'DATABASE_CONNECTION_LOST';
            }
            else {
                message = 'An unexpected error occurred.';
                errorCode = 'UNEXPECTED_ERROR';
            }
        }
        this.logger.error(`Error ${status} on ${request.method} ${request.url}: ${message}`, {
            error: exception,
            request: {
                method: request.method,
                url: request.url,
                userAgent: request.get('User-Agent'),
                ip: request.ip,
            },
        });
        response.status(status).json({
            statusCode: status,
            error: errorCode,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
};
exports.DatabaseExceptionFilter = DatabaseExceptionFilter;
exports.DatabaseExceptionFilter = DatabaseExceptionFilter = DatabaseExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], DatabaseExceptionFilter);
//# sourceMappingURL=database-exception.filter.js.map