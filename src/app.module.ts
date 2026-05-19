import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { GpsModule } from './gps/gps.module';
import { AlarmModule } from './alarm/alarm.module';
import { TrackersModule } from './trackers/trackers.module';
import { ResidentsModule } from './residents/residents.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tracker } from './Entities/tracker.entity';
import { GpsLocation } from './Entities/gps.entity';
import { Resident } from './Entities/resident.entity';
import { AlarmLog } from './Entities/alarm.entity';
import { User } from './Entities/user.entity';
import { Role } from './Entities/role.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [Tracker, GpsLocation, Resident, AlarmLog, User, Role],
        synchronize: true,
        options: {
          encrypt: true,
          trustServerCertificate: true,
        },
      }),
      inject: [ConfigService],
    }),
    GpsModule, 
    AlarmModule, 
    TrackersModule, 
    ResidentsModule, 
    UsersModule, ],
  controllers: [AppController],
  providers: [AppService, WebsocketGateway, Logger],
})
export class AppModule {}
