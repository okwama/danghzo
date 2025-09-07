import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Clients } from './clients.entity';
import { SalesRep } from './sales-rep.entity';

@Entity('ClientAssignment')
@Index('ClientAssignment_salesRepId_idx', ['salesRepId'])
@Index('ClientAssignment_outletId_idx', ['outletId'])
@Index('ClientAssignment_outletId_salesRepId_key', ['outletId', 'salesRepId'])
export class ClientAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'outletId' })
  outletId: number;

  @Column({ name: 'salesRepId' })
  salesRepId: number;

  @Column({ name: 'assignedAt', type: 'datetime', precision: 3 })
  assignedAt: Date;

  @Column({ default: 'active' })
  status: string;

  // Relationships
  @ManyToOne(() => Clients, { nullable: false })
  @JoinColumn({ name: 'outletId' })
  client: Clients;

  @ManyToOne(() => SalesRep, { nullable: false })
  @JoinColumn({ name: 'salesRepId' })
  salesRep: SalesRep;
}

