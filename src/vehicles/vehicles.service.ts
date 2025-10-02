
// ==========================================
// src/modules/vehicles/vehicles.service.ts
// ==========================================
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        skip,
        take: limit,
        where: { isAvailable: true },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where: { isAvailable: true } }),
    ]);

    return {
      data: vehicles,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async search(filters: {
    brand?: string;
    type?: string;
    category?: string;
    priceMin?: number;
    priceMax?: number;
    page: number;
    limit: number;
  }) {
    const { brand, type, category, priceMin, priceMax, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = { isAvailable: true };

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (priceMin || priceMax) {
      where.pricePerDay = {};
      if (priceMin) where.pricePerDay.gte = priceMin;
      if (priceMax) where.pricePerDay.lte = priceMax;
    }

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data: vehicles,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        filters: { brand, type, category, priceMin, priceMax },
      },
    };
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            phone: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    return vehicle;
  }

  async create(createVehicleDto: CreateVehicleDto, ownerId: string) {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        ...createVehicleDto,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      message: 'Véhicule créé avec succès',
      vehicle,
    };
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto, userId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (vehicle.ownerId !== userId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Vous n\'avez pas la permission de modifier ce véhicule',
      );
    }

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: updateVehicleDto,
    });

    return {
      message: 'Véhicule mis à jour avec succès',
      vehicle: updatedVehicle,
    };
  }

  async remove(id: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (vehicle.ownerId !== userId && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Vous n\'avez pas la permission de supprimer ce véhicule',
      );
    }

    await this.prisma.vehicle.delete({
      where: { id },
    });

    return {
      message: 'Véhicule supprimé avec succès',
    };
  }
}
