import { Module } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { SensorController } from './sensor.controller';
import { SensorGateway } from './sensor.gateway';

@Module({
  controllers: [SensorController],
  providers: [SensorService, SensorGateway],
})
export class SensorModule {}
