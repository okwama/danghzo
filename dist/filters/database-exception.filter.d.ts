import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class DatabaseExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
}
