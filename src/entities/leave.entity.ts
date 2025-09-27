import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('leaves')
export class Leave {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar', length: 100 })
  leaveType: string;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachment: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Virtual property for calculating duration
  get durationInDays(): number {
    if (!this.startDate || !this.endDate) return 0;
    const start = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
    const end = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate());
    if (start > end) return 0;

    let daysCount = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
      const isSunday = cursor.getDay() === 0; // 0 = Sunday
      if (!isSunday) {
        daysCount++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return daysCount;
  }
} 