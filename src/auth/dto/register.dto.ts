import { IsNotEmpty, IsString, MinLength, Matches, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Phone number must contain only digits, spaces, hyphens, parentheses, and plus signs' })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNumber()
  @IsNotEmpty()
  countryId: number;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsNumber()
  @IsNotEmpty()
  regionId: number;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsNumber()
  @IsNotEmpty()
  routeId: number;

  @IsString()
  @IsNotEmpty()
  route: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsNumber()
  managerType?: number;

  @IsOptional()
  @IsNumber()
  retailManager?: number;

  @IsOptional()
  @IsNumber()
  keyChannelManager?: number;

  @IsOptional()
  @IsNumber()
  distributionManager?: number;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsNumber()
  managerId?: number;
}
