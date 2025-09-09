import { PartialType } from '@nestjs/mapped-types';
import { CreateUpliftSaleDto } from './create-uplift-sale.dto';

export class UpdateUpliftSaleDto extends PartialType(CreateUpliftSaleDto) {}
