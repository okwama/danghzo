import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phoneNumber: string, password: string): Promise<any> {
    this.logger.log(`🔍 Validating user with phone: ${phoneNumber}`);
    
    const user = await this.usersService.findByPhoneNumber(phoneNumber);
    if (!user) {
      this.logger.warn(`❌ User not found for phone: ${phoneNumber}`);
      return null;
    }
    
    this.logger.log(`👤 User found: ${user.name} (ID: ${user.id}, Status: ${user.status})`);
    
    if (user.status !== 1) {
      this.logger.warn(`❌ User ${user.name} is inactive (status: ${user.status})`);
      return null;
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

  async login(user: any) {
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
    
    // Generate refresh token (same as access token for now, but with longer expiry)
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    this.logger.log(`🔄 Refresh token generated for user: ${user.name}`);
    
    const response = {
      success: true,
      message: 'Login successful',
      accessToken: token,
      refreshToken: refreshToken,
      expiresIn: 32400, // 9 hours in seconds (matching JWT expiry)
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

  async validateToken(token: string): Promise<any> {
    this.logger.log('🔍 Validating JWT token');
    
    try {
      const payload = this.jwtService.verify(token);
      this.logger.log(`✅ JWT token verified for user ID: ${payload.sub}`);
      
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.status !== 1) {
        this.logger.warn(`❌ User not found or inactive for token user ID: ${payload.sub}`);
        throw new UnauthorizedException('Invalid token or user inactive');
      }
      
      this.logger.log(`✅ Token validation successful for user: ${user.name}`);
      return user;
    } catch (error) {
      this.logger.error('❌ JWT token validation failed', error.stack);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(refreshToken: string): Promise<any> {
    this.logger.log('🔄 Refreshing JWT token');
    
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);
      this.logger.log(`✅ Refresh token verified for user ID: ${payload.sub}`);
      
      // Get user from database
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.status !== 1) {
        this.logger.warn(`❌ User not found or inactive for refresh token user ID: ${payload.sub}`);
        throw new UnauthorizedException('Invalid refresh token or user inactive');
      }
      
      // Generate new access token
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
        expiresIn: 32400, // 9 hours in seconds
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
    } catch (error) {
      this.logger.error('❌ Refresh token validation failed', error.stack);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
} 