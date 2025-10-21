import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { BookingValidationService } from './services/booking-validation.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private bookingValidationService: BookingValidationService,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    // Validation métier
    await this.bookingValidationService.validateBooking(createBookingDto);

    // Calcul automatique du prix si non fourni
    let totalPrice = createBookingDto.totalPrice;
    if (!totalPrice) {
      totalPrice = await this.bookingValidationService.calculateTotalPrice(
        createBookingDto.residenceId,
        createBookingDto.vehicleId,
        createBookingDto.offerId,
        createBookingDto.startDate,
        createBookingDto.endDate,
      );
    }

    return this.prisma.booking.create({
      data: {
        ...createBookingDto,
        totalPrice,
        startDate: new Date(createBookingDto.startDate),
        endDate: new Date(createBookingDto.endDate),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        residence: true,
        vehicle: true,
        offer: true,
      },
    });
  }

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        residence: true,
        vehicle: true,
        offer: true,
      },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        residence: true,
        vehicle: true,
        offer: true,
        payments: true,
        reviews: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Réservation non trouvée');
    }

    return booking;
  }

  async findByUser(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        residence: true,
        vehicle: true,
        offer: true,
        payments: true,
        reviews: true,
      },
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    await this.findOne(id);

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        residence: true,
        vehicle: true,
        offer: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.booking.delete({
      where: { id },
    });
  }
}
