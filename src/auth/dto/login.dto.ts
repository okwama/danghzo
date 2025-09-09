import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-9+\-\s()]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/, { 
    message: 'Must be a valid phone number or email address' 
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
} 