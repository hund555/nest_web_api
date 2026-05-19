import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { GpsModule } from './gps/gps.module';
import { AlarmModule } from './alarm/alarm.module';
import { TrackersModule } from './trackers/trackers.module';
import { ResidentsModule } from './residents/residents.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    GpsModule, 
    AlarmModule, 
    TrackersModule, 
    ResidentsModule, 
    UsersModule, ],
  controllers: [AppController],
  providers: [AppService, WebsocketGateway, Logger],
})
export class AppModule {}
