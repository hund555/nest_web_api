import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsocketGateway } from './websocket.gateway';
import { GpsModule } from '../gps/gps.module';
import { GpsLocation } from 'src/entities/gps.entity';
import { Tracker } from 'src/entities/tracker.entity';

@Module({
  imports: [
    GpsModule,
    TypeOrmModule.forFeature([Tracker, GpsLocation]),
  ],
  providers: [WebsocketGateway, Logger],
})
export class WebsocketModule {}