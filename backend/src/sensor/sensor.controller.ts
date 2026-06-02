import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { ApiKeyGuard } from '../auth/guard/api-key/api-key.guard';
import { TelemetryPingDto } from './dto/telemetry-ping.dto';
import { SensorGateway } from './sensor.gateway';

@Controller('sensor')
export class SensorController {
  constructor(
    private readonly sensorService: SensorService,
    private readonly sensorGateway: SensorGateway
  ) { }

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createSensorDto: CreateSensorDto, @GetUser('userId') userId: number) {
    return this.sensorService.create(createSensorDto, userId);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll(@GetUser('userId') userId: number) {
    return this.sensorService.findAll(userId);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('userId') userId: number) {
    return this.sensorService.findOne(+id, userId);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSensorDto: UpdateSensorDto, @GetUser('userId') userId: number) {
    return this.sensorService.update(+id, updateSensorDto, userId);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('userId') userId: number) {
    return this.sensorService.remove(+id, userId);
  }

  @UseGuards(ApiKeyGuard)
  @Post('telemetry')
  async saveTelemetry(@Body() telemetryPingDto: TelemetryPingDto) {
    const result = await this.sensorService.saveTelemetry(telemetryPingDto);
    this.sensorGateway.broadcastTelemetry(telemetryPingDto);
    return result;
  }
}
