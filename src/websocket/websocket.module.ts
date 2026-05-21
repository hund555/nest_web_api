import { Module, Logger } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { GpsModule } from '../gps/gps.module';
import { TrackersModule } from 'src/trackers/trackers.module';

@Module({
  imports: [GpsModule, TrackersModule],
  providers: [WebsocketGateway, Logger],
})
export class WebsocketModule {}