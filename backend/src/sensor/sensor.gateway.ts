import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { SensorService } from './sensor.service';
import { TelemetryPingDto } from './dto/telemetry-ping.dto';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsApiKeyGuard } from '../auth/guard/api-key/ws-api-key.guard';
import { Server, WebSocket } from 'ws';

@WebSocketGateway({ path: '/sensor' })
export class SensorGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly sensorService: SensorService) { }

  @UseGuards(WsApiKeyGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @SubscribeMessage('telemetry')
  async handleTelemetry(@MessageBody() data: TelemetryPingDto) {
    await this.sensorService.saveTelemetry(data);
    this.broadcastTelemetry(data);
    return { event: 'telemetry_ack', status: 'success' };
  }

  broadcastTelemetry(data: TelemetryPingDto) {
    if (this.server && this.server.clients) {
      this.server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ event: 'telemetry_update', data }));
        }
      });
    }
  }
}
