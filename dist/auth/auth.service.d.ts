import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(phoneNumber: string, password: string): Promise<any>;
    login(user: any): Promise<{
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
    validateToken(token: string): Promise<any>;
    refreshToken(refreshToken: string): Promise<any>;
}
