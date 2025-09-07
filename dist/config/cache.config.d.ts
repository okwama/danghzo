import { ConfigService } from '@nestjs/config';
import { CacheModuleOptions } from '@nestjs/cache-manager';
export declare const getCacheConfig: (configService: ConfigService) => CacheModuleOptions;
