import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Resident } from './resident.entity';
import { User } from './user.entity';

@Entity('Alarm_logs')
export class AlarmLog {
  @PrimaryGeneratedColumn()
  ID!: number;

  @ManyToOne(() => Resident, resident => resident.alarmLogs)
  @JoinColumn({ name: 'Resident_ID' })
  resident!: Resident;

  @CreateDateColumn()
  Timestamp!: Date;

  @Column({ nullable: true })
  Description!: string;

  @ManyToOne(() => User, user => user.alarmLogs)
  @JoinColumn({ name: 'User_ID' })
  respondedBy!: User;
}