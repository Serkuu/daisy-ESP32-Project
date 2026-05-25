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
      }
    })
  }

  findOne(id: number, userId: number) {
    return this.prisma.garden.findFirst({
      where: {
        id,
        userId
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
      throw new NotFoundException("Ogród nie został znaleziony lub brak dostępu");
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
      throw new NotFoundException("Ogród nie został znaleziony lub brak dostępu");
    }
    return this.prisma.garden.delete({
      where: {
        id
      }
    })
  }
}
