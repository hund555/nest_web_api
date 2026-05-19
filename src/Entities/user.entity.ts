import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Role } from './role.entity';
import { AlarmLog } from './alarm.entity';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  User_ID!: number;

  @Column()
  Email!: string;

  @Column()
  Name!: string;

  @Column()
  Password!: string;

  @Column({ nullable: true })
  Hash!: string;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'Role_ID' })
  role!: Role;

  @OneToMany(() => AlarmLog, alarm => alarm.respondedBy)
  alarmLogs!: AlarmLog[];
}