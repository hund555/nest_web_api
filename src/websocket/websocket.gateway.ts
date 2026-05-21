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
import { GpsService } from '../gps/gps.service';
import { TrackersService } from '../trackers/trackers.service';
import { GpsLocationDto } from '../dto/gps.dto';

@WebSocketGateway(5000)
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly logger: Logger,
    private readonly gpsService: GpsService,
    private readonly trackersService: TrackersService,
  ) {}

  afterInit() 
  {
    this.logger.log('WebSocket server initialized');
  }

  handleConnection(client: WebSocket) 
  {
    this.logger.log('Client connected');
    client.send(JSON.stringify({ event: 'connected', data: 'Welcome!' }));
  }

  async handleDisconnect(client: WebSocket) 
  {
    const trackerId = this.getTrackerIdFromClient(client);
    if (trackerId) 
    {
      await this.trackersService.setOnlineStatus(trackerId, false);
      this.logger.log(`Tracker ${trackerId} went offline`);
    } 
    else 
    {
      this.logger.log('Unknown client disconnected');
    }
  }

  // Pi has no id.txt — create new tracker in DB and return the ID
  @SubscribeMessage('register')
  async handleRegister(client: WebSocket, payload: { IP: string, Port: number }) 
  {
    const tracker = await this.trackersService.create({ IP: payload.IP, Port: payload.Port });
    await this.trackersService.setOnlineStatus(tracker.Tracker_ID, true);
    (client as any).trackerId = tracker.Tracker_ID;

    client.send(JSON.stringify(
    {
      event: 'registered',
      data: { Tracker_ID: tracker.Tracker_ID },
    }));

    this.logger.log(`New tracker registered with ID ${tracker.Tracker_ID}`);
  }

  // Pi has id.txt — just mark as online
  @SubscribeMessage('identify')
  async handleIdentify(client: WebSocket, payload: { Tracker_ID: number }) 
  {
    const tracker = await this.trackersService.findOne(payload.Tracker_ID);

    if (!tracker) 
    {
      // ID in file no longer exists in DB — treat as new registration
      client.send(JSON.stringify({
        event: 'error',
        data: 'Tracker ID not found, please re-register',
      }));
      return;
    }

    await this.trackersService.setOnlineStatus(payload.Tracker_ID, true);
    (client as any).trackerId = payload.Tracker_ID;

    client.send(JSON.stringify({
      event: 'identified',
      data: { Tracker_ID: payload.Tracker_ID },
    }));

    this.logger.log(`Tracker ${payload.Tracker_ID} identified and online`);
  }

  // Pi sends GPS location
  @SubscribeMessage('gps')
  async handleGps(client: WebSocket, payload: GpsLocationDto) 
  {
    const trackerId = this.getTrackerIdFromClient(client);
    if (!trackerId) 
    {
      client.send(JSON.stringify({
        event: 'error',
        data: 'Not identified, please identify or register first',
      }));
      return;
    }

    await this.gpsService.saveLocation({
      Tracker_ID: trackerId,
      lat: payload.lat,
      lng: payload.lng,
    });

    this.logger.log(`GPS saved for tracker ${trackerId}`);
  }

  // Pi sends battery level
  @SubscribeMessage('battery')
  async handleBattery(client: WebSocket, payload: { battery: number }) 
  {
    const trackerId = this.getTrackerIdFromClient(client);
    if (!trackerId) return;

    await this.trackersService.updateBattery(trackerId, payload.battery);
    this.logger.log(`Battery updated for tracker ${trackerId}: ${payload.battery}%`);
  }

  /**
   * Retrieves the tracker ID from the client's connection context. This is set when the client registers or identifies itself.
   * @param client 
   * @returns 
   */
  private getTrackerIdFromClient(client: WebSocket): number | null 
  {
    return (client as any).trackerId ?? null;
  }
}