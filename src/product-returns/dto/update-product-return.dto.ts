import { PartialType } from '@nestjs/mapped-types';
import { CreateProductReturnDto } from './create-product-return.dto';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdateProductReturnDto extends PartialType(CreateProductReturnDto) {
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'processed'])
  status?: string;
}
