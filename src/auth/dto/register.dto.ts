import { IsNotEmpty, IsString, MinLength, Matches, IsEmail, IsOptional } from 'class-validator';

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

  @IsOptional()
  @IsString()
  role?: string;
}
