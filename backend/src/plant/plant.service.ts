import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlantService {
  constructor(private prisma: PrismaService) { }
  async create(createPlantDto: CreatePlantDto, userId: number) {
    if (createPlantDto.gardenId) {
      const garden = await this.prisma.garden.findFirst({
        where: {
          id: createPlantDto.gardenId,
          userId: userId
        }
      });
      if (!garden) {
        throw new NotFoundException("Ogród nie został znaleziony lub brak dostępu");
      }
    }
    return this.prisma.plant.create({
      data: {
        ...createPlantDto,
        userId
      }
    })
  }

  findAll(userId: number) {
    return this.prisma.plant.findMany({
      where: {
        userId
      }
    })
  }

  findOne(id: number, userId: number) {
    return this.prisma.plant.findFirst({
      where: {
        id,
        userId
      }
    });
  }

  async update(id: number, updatePlantDto: UpdatePlantDto, userId: number) {
    const plant = await this.prisma.plant.findFirst({
      where: {
        id,
        userId
      }
    });
    if (!plant) {
      throw new NotFoundException("Roślina nie została znaleziona lub brak dostępu");
    }
    return this.prisma.plant.update({
      where: {
        id
      },
      data: {
        ...updatePlantDto
      }
    });
  }

  async remove(id: number, userId: number) {
    const plant = await this.prisma.plant.findFirst({
      where: {
        id,
        userId
      }
    });
    if (!plant) {
      throw new NotFoundException("Roślina nie została znaleziona lub brak dostępu");
    }
    return this.prisma.plant.delete({
      where: {
        id
      }
    });
  }
}
