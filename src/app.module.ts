import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { GpsModule } from './gps/gps.module';
import { AlarmModule } from './alarm/alarm.module';

@Module({
  //imports: [GpsModule, AlarmModule],
  controllers: [AppController],
  providers: [AppService, WebsocketGateway, Logger],
})
export class AppModule {}
