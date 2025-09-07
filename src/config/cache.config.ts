import { ConfigService } from '@nestjs/config';
import { CacheModuleOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

export const getCacheConfig = (configService: ConfigService): CacheModuleOptions => ({
  store: redisStore,
  host: configService.get<string>('REDIS_HOST'),
  port: configService.get<number>('REDIS_PORT'),
  password: configService.get<string>('REDIS_PASSWORD'),
  ttl: 300, // 5 minutes default TTL
  max: 100, // maximum number of items in cache
  isGlobal: true,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
});
