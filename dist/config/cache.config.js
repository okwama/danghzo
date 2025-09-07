"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheConfig = void 0;
const redisStore = require("cache-manager-redis-store");
const getCacheConfig = (configService) => ({
    store: redisStore,
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
    password: configService.get('REDIS_PASSWORD'),
    ttl: 300,
    max: 100,
    isGlobal: true,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
});
exports.getCacheConfig = getCacheConfig;
//# sourceMappingURL=cache.config.js.map