
// src/modules/reviews/reviews.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findByItem(itemId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        OR: [
          { residenceId: itemId },
          { vehicleId: itemId },
          { combinedOfferId: itemId },
        ],
      },
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
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    return {
      data: reviews,
      total: reviews.length,
      averageRating: Number(averageRating.toFixed(2)),
    };
  }

  async create(createReviewDto: CreateReviewDto, userId: string) {
    // Vérifier que l'utilisateur a réservé cet item
    const hasReservation = await this.prisma.reservation.findFirst({
      where: {
        userId,
        status: 'COMPLETED',
        OR: [
          { residenceId: createReviewDto.residenceId },
          { vehicleId: createReviewDto.vehicleId },
          { combinedOfferId: createReviewDto.combinedOfferId },
        ],
      },
    });

    if (!hasReservation) {
      throw new BadRequestException(
        'Vous devez avoir complété une réservation pour laisser un avis',
      );
    }

    const review = await this.prisma.review.create({
      data: {
        ...createReviewDto,
        userId,
      },
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
    });

    // Mettre à jour la note moyenne
    await this.updateAverageRating(createReviewDto);

    return {
      message: 'Avis créé avec succès',
      review,
    };
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
    });

    // Mettre à jour la note moyenne
    await this.updateAverageRating({
      residenceId: review.residenceId,
      vehicleId: review.vehicleId,
      combinedOfferId: review.combinedOfferId,
    });

    return {
      message: 'Avis mis à jour avec succès',
      review: updated,
    };
  }

  async remove(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    await this.prisma.review.delete({
      where: { id },
    });

    // Mettre à jour la note moyenne
    await this.updateAverageRating({
      residenceId: review.residenceId,
      vehicleId: review.vehicleId,
      combinedOfferId: review.combinedOfferId,
    });

    return {
      message: 'Avis supprimé avec succès',
    };
  }

  private async updateAverageRating(data: {
    residenceId?: string;
    vehicleId?: string;
    combinedOfferId?: string;
  }) {
    if (data.residenceId) {
      const reviews = await this.prisma.review.findMany({
        where: { residenceId: data.residenceId },
      });
      const avg = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      await this.prisma.residence.update({
        where: { id: data.residenceId },
        data: { rating: avg, reviewCount: reviews.length },
      });
    }

    if (data.vehicleId) {
      const reviews = await this.prisma.review.findMany({
        where: { vehicleId: data.vehicleId },
      });
      const avg = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      await this.prisma.vehicle.update({
        where: { id: data.vehicleId },
        data: { rating: avg, reviewCount: reviews.length },
      });
    }

    if (data.combinedOfferId) {
      const reviews = await this.prisma.review.findMany({
        where: { combinedOfferId: data.combinedOfferId },
      });
      // Note: CombinedOffer n'a pas de champ rating dans le schéma
      // Vous pouvez l'ajouter si nécessaire
    }
  }
}

