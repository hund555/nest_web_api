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

@WebSocketGateway(5000)
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly logger: Logger) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket server initialized');
  }

  handleConnection(client: WebSocket) {
    this.logger.log('Client connected');
    client.send('Welcome to the WebSocket server!');
  }

  handleDisconnect(client: WebSocket) {
    this.logger.log('Client disconnected');
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    this.logger.log(`Received message: ${payload}`);
    return `Echo: ${payload}`;
  }
}