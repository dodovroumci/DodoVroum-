// src/modules/combined-offers/combined-offers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCombinedOfferDto } from './dto/create-combined-offer.dto';
import { UpdateCombinedOfferDto } from './dto/update-combined-offer.dto';

@Injectable()
export class CombinedOffersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [offers, total] = await Promise.all([
      this.prisma.combinedOffer.findMany({
        skip,
        take: limit,
        where: { isAvailable: true },
        include: {
          residence: true,
          vehicle: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.combinedOffer.count({ where: { isAvailable: true } }),
    ]);

    return {
      data: offers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const offer = await this.prisma.combinedOffer.findUnique({
      where: { id },
      include: {
        residence: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        vehicle: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
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

    if (!offer) {
      throw new NotFoundException('Offre combinée non trouvée');
    }

    return offer;
  }

  async create(createCombinedOfferDto: CreateCombinedOfferDto) {
    const offer = await this.prisma.combinedOffer.create({
      data: createCombinedOfferDto,
      include: {
        residence: true,
        vehicle: true,
      },
    });

    return {
      message: 'Offre combinée créée avec succès',
      offer,
    };
  }

  async update(id: string, updateCombinedOfferDto: UpdateCombinedOfferDto) {
    const offer = await this.prisma.combinedOffer.findUnique({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundException('Offre combinée non trouvée');
    }

    const updated = await this.prisma.combinedOffer.update({
      where: { id },
      data: updateCombinedOfferDto,
    });

    return {
      message: 'Offre combinée mise à jour avec succès',
      offer: updated,
    };
  }

  async remove(id: string) {
    const offer = await this.prisma.combinedOffer.findUnique({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundException('Offre combinée non trouvée');
    }

    await this.prisma.combinedOffer.delete({
      where: { id },
    });

    return {
      message: 'Offre combinée supprimée avec succès',
    };
  }
}
