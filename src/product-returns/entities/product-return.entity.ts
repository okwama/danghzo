import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SalesRep } from '../../entities/sales-rep.entity';
import { Product } from '../../entities/product.entity';
import { Clients } from '../../entities/clients.entity';

@Entity('product_returns')
export class ProductReturn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'salesrepId', type: 'int' })
  salesrepId: number;

  @ManyToOne(() => SalesRep)
  @JoinColumn({ name: 'salesrepId' })
  salesrep: SalesRep;

  @Column({ name: 'productId', type: 'int' })
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ name: 'qty', type: 'int' })
  qty: number;

  @Column({ name: 'clientId', type: 'int' })
  clientId: number;

  @ManyToOne(() => Clients)
  @JoinColumn({ name: 'clientId' })
  client: Clients;

  @Column({ name: 'date', type: 'date' })
  date: Date;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'processed'],
    default: 'pending',
  })
  status: string;

  @Column({ name: 'imageUrl', type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
