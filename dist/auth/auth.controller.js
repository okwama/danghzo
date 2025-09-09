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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async register(registerDto) {
        this.logger.log('📝 Registration attempt received');
        this.logger.log(`📱 Phone Number: ${registerDto.phoneNumber}`);
        this.logger.log(`📧 Email: ${registerDto.email}`);
        this.logger.log(`👤 Name: ${registerDto.name}`);
        this.logger.log(`📦 Full payload: ${JSON.stringify(registerDto, null, 2)}`);
        try {
            const result = await this.authService.register(registerDto);
            this.logger.log(`✅ Registration successful for user: ${registerDto.name}`);
            return result;
        }
        catch (error) {
            this.logger.error(`💥 Registration error for phone: ${registerDto.phoneNumber}`, error.stack);
            throw error;
        }
    }
    async login(loginDto) {
        this.logger.log('🔐 Login attempt received');
        this.logger.log(`📱 Phone Number: ${loginDto.phoneNumber}`);
        this.logger.log(`🔑 Password: ${loginDto.password ? '[PROVIDED]' : '[MISSING]'}`);
        this.logger.log(`📦 Full payload: ${JSON.stringify(loginDto, null, 2)}`);
        try {
            const user = await this.authService.authenticateUser(loginDto.phoneNumber, loginDto.password);
            if (!user) {
                this.logger.warn(`❌ Login failed for identifier: ${loginDto.phoneNumber} - Invalid credentials`);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            this.logger.log(`✅ Login successful for ${user.userType}: ${user.name} (ID: ${user.id})`);
            const result = await this.authService.login(user);
            this.logger.log(`🎫 JWT token generated for ${user.userType}: ${user.name}`);
            return result;
        }
        catch (error) {
            this.logger.error(`💥 Login error for identifier: ${loginDto.phoneNumber}`, error.stack);
            throw error;
        }
    }
    async clientLogin(loginDto) {
        this.logger.log('🔐 Client login attempt received');
        this.logger.log(`📧 Email/Name: ${loginDto.phoneNumber}`);
        this.logger.log(`🔑 Password: ${loginDto.password ? '[PROVIDED]' : '[MISSING]'}`);
        try {
            const client = await this.authService.validateClient(loginDto.phoneNumber, loginDto.password);
            if (!client) {
                this.logger.warn(`❌ Client login failed for identifier: ${loginDto.phoneNumber} - Invalid credentials`);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            this.logger.log(`✅ Client login successful: ${client.name} (ID: ${client.id})`);
            const result = await this.authService.login(client);
            this.logger.log(`🎫 JWT token generated for client: ${client.name}`);
            return result;
        }
        catch (error) {
            this.logger.error(`💥 Client login error for identifier: ${loginDto.phoneNumber}`, error.stack);
            throw error;
        }
    }
    async getProfile(req) {
        this.logger.log(`👤 Profile request for user: ${req.user?.name || 'Unknown'}`);
        try {
            const fullUser = await this.authService.validateToken(req.headers.authorization?.replace('Bearer ', ''));
            this.logger.log(`✅ Full user data retrieved: ${fullUser.name}`);
            return fullUser;
        }
        catch (error) {
            this.logger.error('❌ Error retrieving full user data', error.stack);
            throw new common_1.UnauthorizedException('Failed to retrieve user profile');
        }
    }
    logout() {
        this.logger.log('🚪 Logout request received');
        return { message: 'Logged out successfully' };
    }
    async refreshToken(body) {
        this.logger.log('🔄 Refresh token request received');
        try {
            const result = await this.authService.refreshToken(body.refreshToken);
            this.logger.log('✅ Refresh token successful');
            return result;
        }
        catch (error) {
            this.logger.error('❌ Refresh token failed', error.stack);
            throw error;
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('client-login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "clientLogin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('logout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map