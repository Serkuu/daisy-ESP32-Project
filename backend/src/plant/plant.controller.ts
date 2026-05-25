import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlantService } from './plant.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtGuard)
@Controller('plant')
export class PlantController {
  constructor(private readonly plantService: PlantService) { }

  @Post()
  create(@Body() createPlantDto: CreatePlantDto, @GetUser('userId') userId: number) {
    return this.plantService.create(createPlantDto, userId);
  }

  @Get()
  findAll(@GetUser('userId') userId: number) {
    return this.plantService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('userId') userId: number) {
    return this.plantService.findOne(+id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlantDto: UpdatePlantDto, @GetUser('userId') userId: number) {
    return this.plantService.update(+id, updatePlantDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('userId') userId: number) {
    return this.plantService.remove(+id, userId);
  }
}
