// src/modules/reservations/reservations.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    const reservations = await this.prisma.reservation.findMany({
      where: { userId },
      include: {
        residence: true,
        vehicle: true,
        combinedOffer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: reservations,
      total: reservations.length,
    };
  }

  async findOne(id: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        residence: true,
        vehicle: true,
        combinedOffer: true,
        payments: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException('Accès refusé à cette réservation');
    }

    return reservation;
  }

  async create(createReservationDto: CreateReservationDto, userId: string) {
    const { reservationType, checkInDate, checkOutDate } = createReservationDto;

    // Vérifier les dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      throw new BadRequestException('La date de départ doit être après la date d\'arrivée');
    }

    if (checkIn < new Date()) {
      throw new BadRequestException('La date d\'arrivée doit être dans le futur');
    }

    // Calculer le montant total
    let totalAmount = 0;
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (reservationType === 'RESIDENCE' && createReservationDto.residenceId) {
      const residence = await this.prisma.residence.findUnique({
        where: { id: createReservationDto.residenceId },
      });
      if (!residence || !residence.isAvailable) {
        throw new BadRequestException('Résidence non disponible');
      }
      totalAmount = Number(residence.pricePerNight) * days;
    } else if (reservationType === 'VEHICLE' && createReservationDto.vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: createReservationDto.vehicleId },
      });
      if (!vehicle || !vehicle.isAvailable) {
        throw new BadRequestException('Véhicule non disponible');
      }
      totalAmount = Number(vehicle.pricePerDay) * days;
    } else if (reservationType === 'COMBINED' && createReservationDto.combinedOfferId) {
      const offer = await this.prisma.combinedOffer.findUnique({
        where: { id: createReservationDto.combinedOfferId },
      });
      if (!offer || !offer.isAvailable) {
        throw new BadRequestException('Offre combinée non disponible');
      }
      totalAmount = Number(offer.totalPrice);
    }

    const reservation = await this.prisma.reservation.create({
      data: {
        ...createReservationDto,
        userId,
        totalAmount,
      },
      include: {
        residence: true,
        vehicle: true,
        combinedOffer: true,
      },
    });

    return {
      message: 'Réservation créée avec succès',
      reservation,
    };
  }

  async update(id: string, updateReservationDto: UpdateReservationDto, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: updateReservationDto,
    });

    return {
      message: 'Réservation mise à jour avec succès',
      reservation: updated,
    };
  }

  async cancel(id: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    const cancelled = await this.prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return {
      message: 'Réservation annulée avec succès',
      reservation: cancelled,
    };
  }
}
