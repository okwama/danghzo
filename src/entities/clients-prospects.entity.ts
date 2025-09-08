import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SalesRep } from './sales-rep.entity';

@Entity('clients_prospects')
@Index('Clients_countryId_fkey', ['countryId'])
@Index('Clients_countryId_status_route_id_idx', ['countryId', 'status', 'route_id'])
export class ClientsProspects {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'double', nullable: true })
  latitude: number;

  @Column({ type: 'double', nullable: true })
  longitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 2, nullable: true })
  balance: number;

  @Column({ nullable: true })
  email: string;

  @Column()
  region_id: number;

  @Column()
  region: string;

  @Column({ nullable: true })
  route_id: number;

  @Column({ nullable: true })
  route_name: string;

  @Column({ type: 'int', nullable: true })
  route_id_update: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  route_name_update: string;

  @Column()
  contact: string;

  @Column({ nullable: true })
  tax_pin: string;

  @Column({ nullable: true })
  location: string;

  @Column({ default: 1 })
  status: number;

  @Column({ nullable: true })
  client_type: number;

  @Column({ nullable: true })
  outlet_account: number;

  @Column({ type: 'decimal', precision: 11, scale: 2 })
  credit_limit: number;

  @Column()
  payment_terms: number;

  @Column()
  countryId: number;

  @Column({ nullable: true })
  added_by: number;

  @ManyToOne(() => SalesRep, { nullable: true })
  @JoinColumn({ name: 'added_by' })
  addedByUser: SalesRep;

  @Column({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
