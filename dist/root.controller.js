"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootController = void 0;
const common_1 = require("@nestjs/common");
let RootController = class RootController {
    getRoot() {
        return {
            message: 'Welcome to the API! 🚀',
            status: 'online',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            info: 'This is the root endpoint. Use /api/ for API endpoints.',
            endpoints: {
                api: '/api/',
                health: '/api/health',
                ping: '/api/ping'
            }
        };
    }
    getFavicon(res) {
        res.status(204).send();
    }
    getFaviconPng(res) {
        res.status(204).send();
    }
};
exports.RootController = RootController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RootController.prototype, "getRoot", null);
__decorate([
    (0, common_1.Get)('favicon.ico'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RootController.prototype, "getFavicon", null);
__decorate([
    (0, common_1.Get)('favicon.png'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RootController.prototype, "getFaviconPng", null);
exports.RootController = RootController = __decorate([
    (0, common_1.Controller)()
], RootController);
//# sourceMappingURL=root.controller.js.map