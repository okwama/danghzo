import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('sales_order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sales_order_id', type: 'int' })
  salesOrderId: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'sales_order_id' })
  order: Order;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 11, scale: 2 })
  taxAmount: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 15, scale: 2 })
  totalPrice: number;

  @Column({ name: 'tax_type', type: 'enum', enum: ['16%', 'zero_rated', 'exempted'], default: '16%', nullable: true })
  taxType: string;

  @Column({ name: 'net_price', type: 'decimal', precision: 11, scale: 2 })
  netPrice: number;

  @Column({ name: 'shipped_quantity', type: 'int', nullable: true })
  shippedQuantity: number;
} 