import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    private readonly logger;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        message: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        salesRep: {
            id: any;
            name: any;
            email: any;
            phone: any;
            role: any;
            countryId: any;
            regionId: any;
            routeId: any;
            status: any;
            photoUrl: any;
        };
    }>;
    getProfile(req: any): Promise<any>;
    logout(): {
        message: string;
    };
    refreshToken(body: {
        refreshToken: string;
    }): Promise<any>;
}
