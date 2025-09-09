import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUpliftSaleItemDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @IsNotEmpty()
  @IsNumber()
  total: number;
}

export class CreateUpliftSaleDto {
  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUpliftSaleItemDto)
  upliftSaleItems?: CreateUpliftSaleItemDto[];
}
