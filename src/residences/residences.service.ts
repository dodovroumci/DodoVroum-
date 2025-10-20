import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { CreateResidenceDto } from './dto/create-residence.dto';
import { UpdateResidenceDto } from './dto/update-residence.dto';

@Injectable()
export class ResidencesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createResidenceDto: CreateResidenceDto) {
    return this.prisma.residence.create({
      data: createResidenceDto,
    });
  }

  async findAll() {
    return this.prisma.residence.findMany({
      include: {
        propertyType: true,
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const residence = await this.prisma.residence.findUnique({
      where: { id },
      include: {
        propertyType: true,
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!residence) {
      throw new NotFoundException(`Residence with ID ${id} not found`);
    }

    return residence;
  }

  async update(id: number, updateResidenceDto: UpdateResidenceDto) {
    await this.findOne(id);
    
    return this.prisma.residence.update({
      where: { id },
      data: updateResidenceDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    
    return this.prisma.residence.delete({
      where: { id },
    });
  }
}