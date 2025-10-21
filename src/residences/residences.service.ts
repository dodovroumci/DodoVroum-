import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateResidenceDto } from './dto/create-residence.dto';
import { UpdateResidenceDto } from './dto/update-residence.dto';

@Injectable()
export class ResidencesService {
  constructor(private prisma: PrismaService) {}

  async create(createResidenceDto: CreateResidenceDto) {
    return this.prisma.residence.create({
      data: createResidenceDto,
    });
  }

  async findAll() {
    return this.prisma.residence.findMany({
      where: { isActive: true },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const residence = await this.prisma.residence.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!residence) {
      throw new NotFoundException('Résidence non trouvée');
    }

    return residence;
  }

  async update(id: string, updateResidenceDto: UpdateResidenceDto) {
    await this.findOne(id); // Vérifier que la résidence existe

    return this.prisma.residence.update({
      where: { id },
      data: updateResidenceDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Vérifier que la résidence existe

    return this.prisma.residence.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async search(query: string) {
    return this.prisma.residence.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { city: { contains: query, mode: 'insensitive' } },
              { country: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });
  }
}
