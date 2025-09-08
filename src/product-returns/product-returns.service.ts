import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ProductReturn } from './entities/product-return.entity';
import { CreateProductReturnDto } from './dto/create-product-return.dto';
import { UpdateProductReturnDto } from './dto/update-product-return.dto';
import { UpdateReturnStatusDto } from './dto/return-status.dto';

@Injectable()
export class ProductReturnsService {
  constructor(
    @InjectRepository(ProductReturn)
    private productReturnRepository: Repository<ProductReturn>,
  ) {}

  async create(createProductReturnDto: CreateProductReturnDto): Promise<ProductReturn> {
    try {
      const productReturn = this.productReturnRepository.create({
        ...createProductReturnDto,
        date: new Date(createProductReturnDto.date),
      });

      return await this.productReturnRepository.save(productReturn);
    } catch (error) {
      throw new BadRequestException('Failed to create product return');
    }
  }

  async findAll(): Promise<ProductReturn[]> {
    return await this.productReturnRepository.find({
      relations: ['salesrep', 'product', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ProductReturn> {
    const productReturn = await this.productReturnRepository.findOne({
      where: { id },
      relations: ['salesrep', 'product', 'client'],
    });

    if (!productReturn) {
      throw new NotFoundException(`Product return with ID ${id} not found`);
    }

    return productReturn;
  }

  async findBySalesRep(salesrepId: number): Promise<ProductReturn[]> {
    return await this.productReturnRepository.find({
      where: { salesrepId },
      relations: ['salesrep', 'product', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByClient(clientId: number): Promise<ProductReturn[]> {
    return await this.productReturnRepository.find({
      where: { clientId },
      relations: ['salesrep', 'product', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<ProductReturn[]> {
    return await this.productReturnRepository.find({
      where: { status },
      relations: ['salesrep', 'product', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<ProductReturn[]> {
    return await this.productReturnRepository.find({
      where: {
        date: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['salesrep', 'product', 'client'],
      order: { date: 'DESC' },
    });
  }

  async update(id: number, updateProductReturnDto: UpdateProductReturnDto): Promise<ProductReturn> {
    const productReturn = await this.findOne(id);

    Object.assign(productReturn, updateProductReturnDto);

    if (updateProductReturnDto.date) {
      productReturn.date = new Date(updateProductReturnDto.date);
    }

    return await this.productReturnRepository.save(productReturn);
  }

  async updateStatus(id: number, updateStatusDto: UpdateReturnStatusDto): Promise<ProductReturn> {
    const productReturn = await this.findOne(id);

    productReturn.status = updateStatusDto.status;
    if (updateStatusDto.notes) {
      productReturn.notes = updateStatusDto.notes;
    }

    return await this.productReturnRepository.save(productReturn);
  }

  async remove(id: number): Promise<void> {
    const productReturn = await this.findOne(id);
    await this.productReturnRepository.remove(productReturn);
  }

  async getReturnStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    processed: number;
  }> {
    const [total, pending, approved, rejected, processed] = await Promise.all([
      this.productReturnRepository.count(),
      this.productReturnRepository.count({ where: { status: 'pending' } }),
      this.productReturnRepository.count({ where: { status: 'approved' } }),
      this.productReturnRepository.count({ where: { status: 'rejected' } }),
      this.productReturnRepository.count({ where: { status: 'processed' } }),
    ]);

    return { total, pending, approved, rejected, processed };
  }

  async getReturnsByProduct(productId: number): Promise<ProductReturn[]> {
    return await this.productReturnRepository.find({
      where: { productId },
      relations: ['salesrep', 'product', 'client'],
      order: { createdAt: 'DESC' },
    });
  }
}
