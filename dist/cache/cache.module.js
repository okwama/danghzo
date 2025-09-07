"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppCacheModule = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const cache_config_1 = require("../config/cache.config");
const dashboard_cache_service_1 = require("./dashboard-cache.service");
const data_cache_service_1 = require("./data-cache.service");
let AppCacheModule = class AppCacheModule {
};
exports.AppCacheModule = AppCacheModule;
exports.AppCacheModule = AppCacheModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => (0, cache_config_1.getCacheConfig)(configService),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [dashboard_cache_service_1.DashboardCacheService, data_cache_service_1.DataCacheService],
        exports: [dashboard_cache_service_1.DashboardCacheService, data_cache_service_1.DataCacheService],
    })
], AppCacheModule);
//# sourceMappingURL=cache.module.js.map