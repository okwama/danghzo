import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    private readonly logger;
    constructor(authService: AuthService);
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
