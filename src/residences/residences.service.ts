// ==========================================
// src/residences/residences.service.ts
// ==========================================
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';

@Injectable()
export class ResidencesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      city?: string;
      propertyType?: string;
      priceMin?: number;
      priceMax?: number;
    },
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      isAvailable: true,
    };

    if (filters?.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters?.propertyType) {
      where.propertyType = filters.propertyType;
    }

    if (filters?.priceMin || filters?.priceMax) {
      where.pricePerNight = {};
      if (filters.priceMin) {
        where.pricePerNight.gte = filters.priceMin;
      }
      if (filters.priceMax) {
        where.pricePerNight.lte = filters.priceMax;
      }
    }

    const [residences, total] = await Promise.all([
      this.prisma.residence.findMany({
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
          propertyType: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.residence.count({ where }),
    ]);

    // Calculer la note moyenne pour chaque résidence
    const residencesWithRating = residences.map(residence => {
      const avgRating = residence.reviews.length > 0
        ? residence.reviews.reduce((sum, review) => sum + review.rating, 0) / residence.reviews.length
        : 0;

      return {
        ...residence,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: residence.reviews.length,
        reviews: undefined, // Retirer les reviews détaillées de la réponse
      };
    });

    return {
      data: residencesWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async search(searchParams: {
    city?: string;
    propertyType?: string;
    priceMin?: number;
    priceMax?: number;
    amenities?: string[];
    page: number;
    limit: number;
  }) {
    const { page, limit, ...filters } = searchParams;
    return this.findAll(page, limit, filters);
  }

  async findOne(id: string) {
    const residence = await this.prisma.residence.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        propertyType: true,
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        reservations: {
          where: {
            status: { in: ['CONFIRMED', 'PENDING'] },
          },
          select: {
            checkInDate: true,
            checkOutDate: true,
          },
        },
      },
    });

    if (!residence) {
      throw new NotFoundException('Résidence non trouvée');
    }

    // Calculer la note moyenne
    const avgRating = residence.reviews.length > 0
      ? residence.reviews.reduce((sum, review) => sum + review.rating, 0) / residence.reviews.length
      : 0;

    return {
      ...residence,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: residence.reviews.length,
    };
  }

  async findByOwner(ownerId: string) {
    const residences = await this.prisma.residence.findMany({
      where: { ownerId },
      include: {
        propertyType: true,
        reviews: {
          select: {
            rating: true,
          },
        },
        reservations: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            checkInDate: true,
            checkOutDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return residences.map(residence => {
      const avgRating = residence.reviews.length > 0
        ? residence.reviews.reduce((sum, review) => sum + review.rating, 0) / residence.reviews.length
        : 0;

      return {
        ...residence,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: residence.reviews.length,
        totalReservations: residence.reservations.length,
        reviews: undefined,
      };
    });
  }

  async create(createResidenceDto: any, ownerId: string) {
    const residence = await this.prisma.residence.create({
      data: {
        ...createResidenceDto,
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
        propertyType: true,
      },
    });

    return {
      message: 'Résidence créée avec succès',
      residence,
    };
  }

  async update(id: string, updateResidenceDto: any, userId: string) {
    const residence = await this.prisma.residence.findUnique({
      where: { id },
    });

    if (!residence) {
      throw new NotFoundException('Résidence non trouvée');
    }

    if (residence.ownerId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    const updated = await this.prisma.residence.update({
      where: { id },
      data: updateResidenceDto,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        propertyType: true,
      },
    });

    return {
      message: 'Résidence mise à jour avec succès',
      residence: updated,
    };
  }

  async remove(id: string, userId: string) {
    const residence = await this.prisma.residence.findUnique({
      where: { id },
    });

    if (!residence) {
      throw new NotFoundException('Résidence non trouvée');
    }

    if (residence.ownerId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    // Vérifier s'il y a des réservations actives
    const activeReservations = await this.prisma.reservation.count({
      where: {
        residenceId: id,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });

    if (activeReservations > 0) {
      throw new BadRequestException('Impossible de supprimer une résidence avec des réservations actives');
    }

    await this.prisma.residence.delete({
      where: { id },
    });

    return {
      message: 'Résidence supprimée avec succès',
    };
  }

  async getAvailableDates(residenceId: string, month: number, year: number) {
    const residence = await this.prisma.residence.findUnique({
      where: { id: residenceId },
    });

    if (!residence) {
      throw new NotFoundException('Résidence non trouvée');
    }

    const reservations = await this.prisma.reservation.findMany({
      where: {
        residenceId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [
          {
            checkInDate: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
          {
            checkOutDate: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
        ],
      },
      select: {
        checkInDate: true,
        checkOutDate: true,
      },
    });

    return {
      residenceId,
      month,
      year,
      reservations,
    };
  }
}