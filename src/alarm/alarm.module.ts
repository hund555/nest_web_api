import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmLog } from '../entities/alarm.entity';
import { AlarmService } from './alarm.service';
import { AlarmController } from './alarm.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlarmLog])],
  providers: [AlarmService],
  controllers: [AlarmController],
  exports: [AlarmService],
})
export class AlarmModule {}