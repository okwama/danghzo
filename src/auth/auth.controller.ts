import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
//  import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) // Explicitly return 200 status code
  async login(@Body() loginDto: LoginDto) {
    this.logger.log('🔐 Login attempt received');
    this.logger.log(`📱 Phone Number: ${loginDto.phoneNumber}`);
    this.logger.log(`🔑 Password: ${loginDto.password ? '[PROVIDED]' : '[MISSING]'}`);
    this.logger.log(`📦 Full payload: ${JSON.stringify(loginDto, null, 2)}`);
    
    try {
      const user = await this.authService.validateUser(loginDto.phoneNumber, loginDto.password);
      if (!user) {
        this.logger.warn(`❌ Login failed for phone: ${loginDto.phoneNumber} - Invalid credentials`);
        throw new UnauthorizedException('Invalid credentials');
      }
      
      this.logger.log(`✅ Login successful for user: ${user.name} (ID: ${user.id})`);
      const result = await this.authService.login(user);
      this.logger.log(`🎫 JWT token generated for user: ${user.name}`);
      
      // Return 200 status code instead of 201
      return result;
    } catch (error) {
      this.logger.error(`💥 Login error for phone: ${loginDto.phoneNumber}`, error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    this.logger.log(`👤 Profile request for user: ${req.user?.name || 'Unknown'}`);
    
    // Get full user data from database instead of just JWT payload
    try {
      const fullUser = await this.authService.validateToken(req.headers.authorization?.replace('Bearer ', ''));
      this.logger.log(`✅ Full user data retrieved: ${fullUser.name}`);
      return fullUser;
    } catch (error) {
      this.logger.error('❌ Error retrieving full user data', error.stack);
      throw new UnauthorizedException('Failed to retrieve user profile');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout() {
    this.logger.log('🚪 Logout request received');
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    this.logger.log('🔄 Refresh token request received');
    
    try {
      const result = await this.authService.refreshToken(body.refreshToken);
      this.logger.log('✅ Refresh token successful');
      return result;
    } catch (error) {
      this.logger.error('❌ Refresh token failed', error.stack);
      throw error;
    }
  }
} 