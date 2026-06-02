import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGardenDto } from './dto/create-garden.dto';
import { UpdateGardenDto } from './dto/update-garden.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GardenService {
  constructor(private prisma: PrismaService) { }

  create(createGardenDto: CreateGardenDto, userId: number) {
    return this.prisma.garden.create({
      data: {
        ...createGardenDto,
        userId
      }
    })
  }

  findAll(userId: number) {
    return this.prisma.garden.findMany({
      where: {
        userId
      },
      include: {
        plants: true,
        headUnit: true
      }
    })
  }

  findOne(id: number, userId: number) {
    return this.prisma.garden.findFirst({
      where: {
        id,
        userId
      },
      include: {
        plants: true,
        headUnit: true
      }
    })
  }

  async update(id: number, updateGardenDto: UpdateGardenDto, userId: number) {
    const garden = await this.prisma.garden.findFirst({
      where: {
        id,
        userId
      }
    });
    if (!garden) {
      throw new NotFoundException("Garden not found or access denied");
    }
    return this.prisma.garden.update({
      where: {
        id
      },
      data: {
        ...updateGardenDto
      }
    });
  }

  async remove(id: number, userId: number) {
    const garden = await this.prisma.garden.findFirst({
      where: {
        id,
        userId
      }
    });
    if (!garden) {
      throw new NotFoundException("Garden not found or access denied");
    }
    await this.prisma.plant.updateMany({
      where: { gardenId: id },
      data: { gardenId: null }
    });

    return this.prisma.garden.delete({
      where: {
        id
      }
    })
  }
}
