import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async create(createFavoriteDto: CreateFavoriteDto) {
    return this.prisma.favorite.create({
      data: createFavoriteDto,
      include: {
        residence: true,
        vehicle: true,
      },
    });
  }

  async findAll() {
    return this.prisma.favorite.findMany({
      include: {
        residence: true,
        vehicle: true,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        residence: true,
        vehicle: true,
      },
    });
  }

  async findOne(id: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { id },
      include: {
        residence: true,
        vehicle: true,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favori non trouvé');
    }

    return favorite;
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.favorite.delete({
      where: { id },
    });
  }

  async removeByUserAndItem(userId: string, residenceId?: string, vehicleId?: string) {
    const whereClause: any = { userId };
    
    if (residenceId) {
      whereClause.residenceId = residenceId;
    }
    
    if (vehicleId) {
      whereClause.vehicleId = vehicleId;
    }

    return this.prisma.favorite.deleteMany({
      where: whereClause,
    });
  }
}
