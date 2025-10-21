import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: createVehicleDto,
    });
  }

  async findAll() {
    return this.prisma.vehicle.findMany({
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
    const vehicle = await this.prisma.vehicle.findUnique({
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

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    await this.findOne(id); // Vérifier que le véhicule existe

    return this.prisma.vehicle.update({
      where: { id },
      data: updateVehicleDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Vérifier que le véhicule existe

    return this.prisma.vehicle.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async search(query: string) {
    return this.prisma.vehicle.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { brand: { contains: query, mode: 'insensitive' } },
              { model: { contains: query, mode: 'insensitive' } },
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

  async findByType(type: string) {
    return this.prisma.vehicle.findMany({
      where: {
        AND: [
          { isActive: true },
          { type: type as any },
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
