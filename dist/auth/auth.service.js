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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcryptjs");
let AuthService = AuthService_1 = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async validateUser(phoneNumber, password) {
        this.logger.log(`🔍 Validating user with phone: ${phoneNumber}`);
        const user = await this.usersService.findByPhoneNumber(phoneNumber);
        if (!user) {
            this.logger.warn(`❌ User not found for phone: ${phoneNumber}`);
            return null;
        }
        this.logger.log(`👤 User found: ${user.name} (ID: ${user.id}, Status: ${user.status})`);
        if (user.status !== 1) {
            if (user.status === 0) {
                this.logger.warn(`❌ User ${user.name} account is pending approval (status: ${user.status})`);
                throw new common_1.UnauthorizedException('Your account is pending approval. Please wait for admin approval before logging in.');
            }
            else {
                this.logger.warn(`❌ User ${user.name} is inactive (status: ${user.status})`);
                throw new common_1.UnauthorizedException('Your account is inactive. Please contact support.');
            }
        }
        const isValidPassword = await user.validatePassword(password);
        this.logger.log(`🔐 Password validation for ${user.name}: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);
        if (isValidPassword) {
            const { password, ...result } = user;
            this.logger.log(`✅ User ${user.name} validated successfully`);
            return result;
        }
        this.logger.warn(`❌ Invalid password for user: ${user.name}`);
        return null;
    }
    async login(user) {
        this.logger.log(`🎫 Generating JWT token for user: ${user.name}`);
        const payload = {
            phoneNumber: user.phoneNumber,
            sub: user.id,
            role: user.role,
            countryId: user.countryId,
            regionId: user.region_id,
            routeId: user.route_id
        };
        this.logger.log(`📦 JWT payload: ${JSON.stringify(payload, null, 2)}`);
        const token = this.jwtService.sign(payload);
        this.logger.log(`🎫 JWT token generated successfully for user: ${user.name}`);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        this.logger.log(`🔄 Refresh token generated for user: ${user.name}`);
        const response = {
            success: true,
            message: 'Login successful',
            accessToken: token,
            refreshToken: refreshToken,
            expiresIn: 32400,
            salesRep: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phoneNumber,
                role: user.role,
                countryId: user.countryId,
                regionId: user.region_id,
                routeId: user.route_id,
                status: user.status,
                photoUrl: user.photoUrl
            }
        };
        this.logger.log(`📤 Login response prepared for user: ${user.name}`);
        return response;
    }
    async validateToken(token) {
        this.logger.log('🔍 Validating JWT token');
        try {
            const payload = this.jwtService.verify(token);
            this.logger.log(`✅ JWT token verified for user ID: ${payload.sub}`);
            const user = await this.usersService.findById(payload.sub);
            if (!user || user.status !== 1) {
                this.logger.warn(`❌ User not found or inactive for token user ID: ${payload.sub}`);
                throw new common_1.UnauthorizedException('Invalid token or user inactive');
            }
            this.logger.log(`✅ Token validation successful for user: ${user.name}`);
            return user;
        }
        catch (error) {
            this.logger.error('❌ JWT token validation failed', error.stack);
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async refreshToken(refreshToken) {
        this.logger.log('🔄 Refreshing JWT token');
        try {
            const payload = this.jwtService.verify(refreshToken);
            this.logger.log(`✅ Refresh token verified for user ID: ${payload.sub}`);
            const user = await this.usersService.findById(payload.sub);
            if (!user || user.status !== 1) {
                this.logger.warn(`❌ User not found or inactive for refresh token user ID: ${payload.sub}`);
                throw new common_1.UnauthorizedException('Invalid refresh token or user inactive');
            }
            const newPayload = {
                phoneNumber: user.phoneNumber,
                sub: user.id,
                role: user.role,
                countryId: user.countryId,
                regionId: user.region_id,
                routeId: user.route_id
            };
            const newAccessToken = this.jwtService.sign(newPayload);
            const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });
            this.logger.log(`✅ New tokens generated for user: ${user.name}`);
            const response = {
                success: true,
                message: 'Token refreshed successfully',
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                expiresIn: 32400,
                salesRep: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phoneNumber,
                    role: user.role,
                    countryId: user.countryId,
                    regionId: user.region_id,
                    routeId: user.route_id,
                    status: user.status,
                    photoUrl: user.photoUrl
                }
            };
            this.logger.log(`📤 Refresh response prepared for user: ${user.name}`);
            return response;
        }
        catch (error) {
            this.logger.error('❌ Refresh token validation failed', error.stack);
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async register(registerData) {
        this.logger.log('📝 User registration attempt');
        this.logger.log(`📱 Phone Number: ${registerData.phoneNumber}`);
        this.logger.log(`📧 Email: ${registerData.email}`);
        this.logger.log(`👤 Name: ${registerData.name}`);
        try {
            const existingUserByPhone = await this.usersService.findByPhoneNumber(registerData.phoneNumber);
            if (existingUserByPhone) {
                this.logger.warn(`❌ User already exists with phone: ${registerData.phoneNumber}`);
                throw new common_1.ConflictException('User with this phone number already exists');
            }
            const existingUserByEmail = await this.usersService.findByEmail(registerData.email);
            if (existingUserByEmail) {
                this.logger.warn(`❌ User already exists with email: ${registerData.email}`);
                throw new common_1.ConflictException('User with this email already exists');
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(registerData.password, saltRounds);
            this.logger.log(`🔐 Password hashed successfully`);
            const userData = {
                name: registerData.name,
                email: registerData.email,
                phoneNumber: registerData.phoneNumber,
                password: hashedPassword,
                countryId: registerData.countryId,
                country: registerData.country,
                region_id: registerData.regionId,
                region: registerData.region,
                route_id: registerData.routeId,
                route: registerData.route,
                route_id_update: registerData.routeId,
                route_name_update: registerData.route,
                role: registerData.role || 'SALES_REP',
                managerType: registerData.managerType || 0,
                status: 0,
                retail_manager: registerData.retailManager || 0,
                key_channel_manager: registerData.keyChannelManager || 0,
                distribution_manager: registerData.distributionManager || 0,
                visits_targets: 0,
                new_clients: 0,
                vapes_targets: 0,
                pouches_targets: 0,
                photoUrl: registerData.photoUrl || '',
                managerId: registerData.managerId || null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const newUser = await this.usersService.create(userData);
            this.logger.log(`✅ User created successfully: ${newUser.name} (ID: ${newUser.id})`);
            this.logger.log(`📝 User registered successfully and pending approval: ${newUser.name}`);
            const response = {
                success: true,
                message: 'Account created successfully! Your account is pending approval. You will receive an email notification once your account is approved.',
                requiresApproval: true,
                status: 'pending',
                salesRep: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phoneNumber,
                    role: newUser.role,
                    countryId: newUser.countryId,
                    regionId: newUser.region_id,
                    routeId: newUser.route_id,
                    status: newUser.status,
                    photoUrl: newUser.photoUrl
                }
            };
            this.logger.log(`📤 Registration response prepared for user: ${newUser.name}`);
            return response;
        }
        catch (error) {
            this.logger.error(`💥 Registration error for phone: ${registerData.phoneNumber}`, error.stack);
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map