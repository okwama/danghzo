import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesRep } from './sales-rep.entity';
import { Clients } from './clients.entity';

@Entity('CompetitorReport')
export class CompetitorReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reportId', nullable: true })
  reportId: number;

  @Column({ name: 'competitorName', nullable: true })
  competitorName: string;

  @Column({ name: 'productName', nullable: true })
  productName: string;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ name: 'quantity', nullable: true })
  quantity: number;

  @Column({ name: 'promotion', type: 'text', nullable: true })
  promotion: string;

  @Column({ name: 'comment', type: 'text', nullable: true })
  comment: string;

  @Column({ name: 'imageUrl', nullable: true })
  imageUrl: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @Column({ name: 'clientId' })
  clientId: number;

  @Column({ name: 'userId' })
  userId: number;

  @ManyToOne(() => SalesRep)
  @JoinColumn({ name: 'userId' })
  user: SalesRep;

  @ManyToOne(() => Clients)
  @JoinColumn({ name: 'clientId' })
  client: Clients;
}

