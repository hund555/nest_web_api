import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tracker } from '../entities/tracker.entity';
import { GpsLocation } from '../entities/gps.entity';

@WebSocketGateway(5000)
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(

    private readonly logger: Logger,

    @InjectRepository(Tracker)
    private readonly trackerRepository: Repository<Tracker>,

    @InjectRepository(GpsLocation)
    private readonly gpsRepository: Repository<GpsLocation>,

  ) { }
  private trackerConnections =
    new Map<WebSocket, number>();

  afterInit(server: Server) {
    this.logger.log('WebSocket server initialized');
  }

  handleConnection(client: WebSocket) {

    this.logger.log('Client connected');

    client.send('Connected');
  }

  async handleDisconnect(client: WebSocket) {

    const trackerId =
      this.trackerConnections.get(client);

    this.logger.log(
      `Tracker ${trackerId} disconnected`
    );

    if (trackerId) {

      const tracker =
        await this.trackerRepository.findOne({
          where: {
            Tracker_ID: trackerId
          }
        });

      if (tracker) {

        tracker.IsOnline = false;

        await this.trackerRepository.save(tracker);
      }
    }

    this.trackerConnections.delete(client);
  }

  @SubscribeMessage('gps')
  async handleGps(
    client: WebSocket,
    payload: any
  ): Promise<void> {

    const trackerId = payload.trackerId;

    this.trackerConnections.set(
      client,
      trackerId
    );

    const tracker =
      await this.trackerRepository.findOne({
        where: {
          Tracker_ID: trackerId
        }
      });

    if (!tracker) {

      this.logger.error(
        `Tracker ${trackerId} not found`
      );

      return;
    }

    // Tracker online
    tracker.IsOnline = true;

    tracker.LastSeen = new Date();

    await this.trackerRepository.save(tracker);

    // Save GPS
    const gps =
      this.gpsRepository.create({

        tracker,

        lat: payload.lat,

        lng: payload.lng
      });

    await this.gpsRepository.save(gps);

    this.logger.log(
      `Tracker ${trackerId} ONLINE`
    );

    this.logger.log(
      `GPS: ${payload.lat}, ${payload.lng}`
    );
  }
}