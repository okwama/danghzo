import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductReturnsService } from './product-returns.service';
import { ProductReturnsController } from './product-returns.controller';
import { ProductReturn } from './entities/product-return.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductReturn])],
  controllers: [ProductReturnsController],
  providers: [ProductReturnsService],
  exports: [ProductReturnsService],
})
export class ProductReturnsModule {}
