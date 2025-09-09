import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpliftSale } from '../entities/uplift-sale.entity';
import { UpliftSaleItem } from '../entities/uplift-sale-item.entity';
import { CreateUpliftSaleDto } from './dto/create-uplift-sale.dto';
import { UpdateUpliftSaleDto } from './dto/update-uplift-sale.dto';

@Injectable()
export class UpliftSalesService {
  constructor(
    @InjectRepository(UpliftSale)
    private upliftSaleRepository: Repository<UpliftSale>,
    @InjectRepository(UpliftSaleItem)
    private upliftSaleItemRepository: Repository<UpliftSaleItem>,
  ) {}

  async findAll(query: any) {
    try {
      const queryBuilder = this.upliftSaleRepository.createQueryBuilder('upliftSale')
        .leftJoinAndSelect('upliftSale.client', 'client')
        .leftJoinAndSelect('upliftSale.user', 'user')
        .leftJoinAndSelect('upliftSale.upliftSaleItems', 'items');

      if (query.userId) {
        queryBuilder.where('upliftSale.userId = :userId', { userId: query.userId });
      }

      if (query.status) {
        queryBuilder.andWhere('upliftSale.status = :status', { status: query.status });
      }

      if (query.startDate) {
        queryBuilder.andWhere('upliftSale.createdAt >= :startDate', { startDate: query.startDate });
      }

      if (query.endDate) {
        queryBuilder.andWhere('upliftSale.createdAt <= :endDate', { endDate: query.endDate });
      }

      return queryBuilder.orderBy('upliftSale.createdAt', 'DESC').getMany();
    } catch (error) {
      console.error('Error fetching uplift sales:', error);
      throw new Error('Failed to fetch uplift sales');
    }
  }

  async findOne(id: number) {
    try {
      return this.upliftSaleRepository.findOne({
        where: { id },
        relations: ['client', 'user', 'upliftSaleItems']
      });
    } catch (error) {
      console.error('Error fetching uplift sale by ID:', error);
      throw new Error('Failed to fetch uplift sale');
    }
  }

  async create(createUpliftSaleDto: CreateUpliftSaleDto, userId: number) {
    try {
      console.log('🔍 UpliftSalesService: Received create request:', JSON.stringify(createUpliftSaleDto, null, 2));
      console.log('🔍 UpliftSalesService: UserId from JWT:', userId);
      
      // Extract items from the DTO and add userId
      const { upliftSaleItems, ...upliftSaleData } = createUpliftSaleDto;
      const upliftSaleWithUser = { ...upliftSaleData, userId };
      
      console.log('🔍 UpliftSalesService: Extracted items:', JSON.stringify(upliftSaleItems, null, 2));
      console.log('🔍 UpliftSalesService: Final uplift sale data:', JSON.stringify(upliftSaleWithUser, null, 2));
      
      // Create the main uplift sale record
      const upliftSale = this.upliftSaleRepository.create(upliftSaleWithUser);
      const savedUpliftSale = await this.upliftSaleRepository.save(upliftSale);
      
      console.log('✅ UpliftSalesService: Created main uplift sale with ID:', savedUpliftSale.id);
      
      // Create uplift sale items if they exist
      if (upliftSaleItems && upliftSaleItems.length > 0) {
        const items: any[] = [];
        for (const item of upliftSaleItems) {
          const upliftSaleItem = this.upliftSaleItemRepository.create({
            ...item,
            upliftSaleId: savedUpliftSale.id,
          });
          items.push(upliftSaleItem);
        }
        
        const savedItems = await this.upliftSaleItemRepository.save(items);
        
        console.log('✅ UpliftSalesService: Created ${savedItems.length} uplift sale items');
        
        // Update total amount based on items
        const totalAmount = savedItems.reduce((sum, item) => sum + item.total, 0);
        await this.upliftSaleRepository.update(savedUpliftSale.id, { totalAmount });
        
        console.log('✅ UpliftSalesService: Updated total amount to:', totalAmount);
      }
      
      // Return the complete uplift sale with items
      return this.findOne(savedUpliftSale.id);
    } catch (error) {
      console.error('Error creating uplift sale:', error);
      throw new Error('Failed to create uplift sale');
    }
  }

  async update(id: number, updateUpliftSaleDto: UpdateUpliftSaleDto) {
    try {
      // Extract items from the DTO
      const { upliftSaleItems, ...upliftSaleData } = updateUpliftSaleDto;
      
      // Update the main uplift sale record
      await this.upliftSaleRepository.update(id, upliftSaleData);
      
      // Handle items if they exist
      if (upliftSaleItems && upliftSaleItems.length > 0) {
        // Delete existing items
        await this.upliftSaleItemRepository.delete({ upliftSaleId: id });
        
        // Create new items
        const items: any[] = [];
        for (const item of upliftSaleItems) {
          const upliftSaleItem = this.upliftSaleItemRepository.create({
            ...item,
            upliftSaleId: id,
          });
          items.push(upliftSaleItem);
        }
        
        const savedItems = await this.upliftSaleItemRepository.save(items);
        
        // Update total amount based on items
        const totalAmount = savedItems.reduce((sum, item) => sum + item.total, 0);
        await this.upliftSaleRepository.update(id, { totalAmount });
      }
      
      return this.findOne(id);
    } catch (error) {
      console.error('Error updating uplift sale:', error);
      throw new Error('Failed to update uplift sale');
    }
  }

  async remove(id: number) {
    try {
      await this.upliftSaleRepository.delete(id);
      return { message: 'Uplift sale deleted successfully' };
    } catch (error) {
      console.error('Error deleting uplift sale:', error);
      throw new Error('Failed to delete uplift sale');
    }
  }
} 