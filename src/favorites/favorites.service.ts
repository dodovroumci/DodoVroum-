// src/modules/favorites/favorites.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        residence: true,
        vehicle: true,
        combinedOffer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: favorites,
      total: favorites.length,
    };
  }

  async create(createFavoriteDto: CreateFavoriteDto, userId: string) {
    // Vérifier si le favori existe déjà
    const existing = await this.prisma.favorite.findFirst({
      where: {
        userId,
        residenceId: createFavoriteDto.residenceId,
        vehicleId: createFavoriteDto.vehicleId,
        combinedOfferId: createFavoriteDto.combinedOfferId,
      },
    });

    if (existing) {
      throw new ConflictException('Déjà dans les favoris');
    }

    const favorite = await this.prisma.favorite.create({
      data: {
        ...createFavoriteDto,
        userId,
      },
      include: {
        residence: true,
        vehicle: true,
        combinedOffer: true,
      },
    });

    return {
      message: 'Ajouté aux favoris',
      favorite,
    };
  }

  async remove(id: string, userId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { id },
    });

    if (!favorite) {
      throw new NotFoundException('Favori non trouvé');
    }

    if (favorite.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    await this.prisma.favorite.delete({
      where: { id },
    });

    return {
      message: 'Retiré des favoris',
    };
  }
}


