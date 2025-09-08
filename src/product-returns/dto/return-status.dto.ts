import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateReturnStatusDto {
  @IsEnum(['pending', 'approved', 'rejected', 'processed'])
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
