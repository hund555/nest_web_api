import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alarm } from '../entities/alarm.entity';

@Injectable()
export class AlarmService 
{
  constructor(
    @InjectRepository(Alarm)
    private readonly alarmRepository: Repository<Alarm>,
  ) {}

  async triggerAlarm(trackerId: number): Promise<Alarm> 
  {
    const alarm = this.alarmRepository.create({
      tracker: { Tracker_ID: trackerId },
    });
    return this.alarmRepository.save(alarm);
  }

  async findAll(): Promise<Alarm[]> 
  {
    return this.alarmRepository.find({
      relations: ['tracker'],
      order: { Timestamp: 'DESC' },
    });
  }

  async findByTracker(trackerId: number): Promise<Alarm[]> 
  {
    return this.alarmRepository.find({
      where: { tracker: { Tracker_ID: trackerId } },
      relations: ['tracker'],
      order: { Timestamp: 'DESC' },
    });
  }
}