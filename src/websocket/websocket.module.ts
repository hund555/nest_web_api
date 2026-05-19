import { Module, Logger } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { GpsModule } from '../gps/gps.module';

@Module({
  imports: [GpsModule],
  providers: [WebsocketGateway, Logger],
})
export class WebsocketModule {}