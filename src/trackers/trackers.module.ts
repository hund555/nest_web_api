import { Module } from '@nestjs/common';
import { TrackersService } from './trackers.service';
import { TrackersController } from './trackers.controller';

@Module({
  providers: [TrackersService],
  controllers: [TrackersController]
})
export class TrackersModule {}
