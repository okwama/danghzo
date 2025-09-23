"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    canActivate(context) {
        return super.canActivate(context);
    }
    handleRequest(err, user, info, context) {
        const request = context.switchToHttp().getRequest();
        const endpoint = request.url;
        if (err || !user) {
            let message = 'Authentication required to access this resource';
            if (info?.name === 'TokenExpiredError') {
                message = 'Your session has expired. Please log in again.';
            }
            else if (info?.name === 'JsonWebTokenError') {
                message = 'Invalid authentication token. Please log in again.';
            }
            else if (info?.name === 'NotBeforeError') {
                message = 'Authentication token is not yet valid.';
            }
            else if (endpoint.includes('/products')) {
                message = 'Please log in to view products and make purchases.';
            }
            else if (endpoint.includes('/clients')) {
                message = 'Please log in to access client information.';
            }
            else if (endpoint.includes('/orders')) {
                message = 'Please log in to view your orders.';
            }
            else if (endpoint.includes('/dashboard')) {
                message = 'Please log in to access your dashboard.';
            }
            else if (endpoint.includes('/profile')) {
                message = 'Please log in to view your profile.';
            }
            throw new common_1.UnauthorizedException({
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
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map