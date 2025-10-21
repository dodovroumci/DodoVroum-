import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  async create(createOfferDto: CreateOfferDto) {
    return this.prisma.offer.create({
      data: createOfferDto,
      include: {
        residence: true,
        vehicle: true,
      },
    });
  }

  async findAll() {
    return this.prisma.offer.findMany({
      where: { isActive: true },
      include: {
        residence: true,
        vehicle: true,
      },
    });
  }

  async findOne(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        residence: true,
        vehicle: true,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offre non trouvée');
    }

    return offer;
  }

  async update(id: string, updateOfferDto: UpdateOfferDto) {
    await this.findOne(id);

    return this.prisma.offer.update({
      where: { id },
      data: updateOfferDto,
      include: {
        residence: true,
        vehicle: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.offer.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
