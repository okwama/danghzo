import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
//  import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log('📝 Registration attempt received');
    this.logger.log(`📱 Phone Number: ${registerDto.phoneNumber}`);
    this.logger.log(`📧 Email: ${registerDto.email}`);
    this.logger.log(`👤 Name: ${registerDto.name}`);
    this.logger.log(`📦 Full payload: ${JSON.stringify(registerDto, null, 2)}`);
    
    try {
      const result = await this.authService.register(registerDto);
      this.logger.log(`✅ Registration successful for user: ${registerDto.name}`);
      return result;
    } catch (error) {
      this.logger.error(`💥 Registration error for phone: ${registerDto.phoneNumber}`, error.stack);
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // Explicitly return 200 status code
  async login(@Body() loginDto: LoginDto) {
    this.logger.log('🔐 Login attempt received');
    this.logger.log(`📱 Phone Number: ${loginDto.phoneNumber}`);
    this.logger.log(`🔑 Password: ${loginDto.password ? '[PROVIDED]' : '[MISSING]'}`);
    this.logger.log(`📦 Full payload: ${JSON.stringify(loginDto, null, 2)}`);
    
    try {
      const user = await this.authService.authenticateUser(loginDto.phoneNumber, loginDto.password);
      if (!user) {
        this.logger.warn(`❌ Login failed for identifier: ${loginDto.phoneNumber} - Invalid credentials`);
        throw new UnauthorizedException('Invalid credentials');
      }
      
      this.logger.log(`✅ Login successful for ${user.userType}: ${user.name} (ID: ${user.id})`);
      const result = await this.authService.login(user);
      this.logger.log(`🎫 JWT token generated for ${user.userType}: ${user.name}`);
      
      // Return 200 status code instead of 201
      return result;
    } catch (error) {
      this.logger.error(`💥 Login error for identifier: ${loginDto.phoneNumber}`, error.stack);
      throw error;
    }
  }

  @Post('client-login')
  @HttpCode(HttpStatus.OK)
  async clientLogin(@Body() loginDto: LoginDto) {
    this.logger.log('🔐 Client login attempt received');
    this.logger.log(`📧 Email/Name: ${loginDto.phoneNumber}`); // Reusing phoneNumber field for identifier
    this.logger.log(`🔑 Password: ${loginDto.password ? '[PROVIDED]' : '[MISSING]'}`);
    
    try {
      const client = await this.authService.validateClient(loginDto.phoneNumber, loginDto.password);
      if (!client) {
        this.logger.warn(`❌ Client login failed for identifier: ${loginDto.phoneNumber} - Invalid credentials`);
        throw new UnauthorizedException('Invalid credentials');
      }
      
      this.logger.log(`✅ Client login successful: ${client.name} (ID: ${client.id})`);
      const result = await this.authService.login(client);
      this.logger.log(`🎫 JWT token generated for client: ${client.name}`);
      
      return result;
    } catch (error) {
      this.logger.error(`💥 Client login error for identifier: ${loginDto.phoneNumber}`, error.stack);
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