import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingValidationService } from './services/booking-validation.service';
import { PrismaService } from '../common/prisma/prisma.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let prismaService: jest.Mocked<PrismaService>;
  let validationService: jest.Mocked<BookingValidationService>;

  const mockBooking = {
    id: 'booking-id',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-07'),
    totalPrice: 500.0,
    status: 'PENDING',
    userId: 'user-id',
    residenceId: 'residence-id',
    vehicleId: null,
    offerId: null,
    notes: 'Test booking',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateBookingDto = {
    startDate: '2024-06-01T00:00:00Z',
    endDate: '2024-06-07T23:59:59Z',
    totalPrice: 500.0,
    residenceId: 'residence-id',
    notes: 'Test booking',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: {
            booking: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: BookingValidationService,
          useValue: {
            validateBooking: jest.fn(),
            calculateTotalPrice: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prismaService = module.get(PrismaService);
    validationService = module.get(BookingValidationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a booking with validation', async () => {
      validationService.validateBooking.mockResolvedValue(undefined);
      prismaService.booking.create.mockResolvedValue({
        ...mockBooking,
        user: { id: 'user-id', firstName: 'John', lastName: 'Doe', email: 'test@example.com' },
        residence: { id: 'residence-id', title: 'Test Residence' },
        vehicle: null,
        offer: null,
      });

      const result = await service.create(mockCreateBookingDto);

      expect(validationService.validateBooking).toHaveBeenCalledWith(mockCreateBookingDto);
      expect(prismaService.booking.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateBookingDto,
          totalPrice: 500.0,
          startDate: new Date('2024-06-01T00:00:00Z'),
          endDate: new Date('2024-06-07T23:59:59Z'),
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
      expect(result).toBeDefined();
    });

    it('should calculate total price when not provided', async () => {
      const dtoWithoutPrice = { ...mockCreateBookingDto };
      delete dtoWithoutPrice.totalPrice;

      validationService.validateBooking.mockResolvedValue(undefined);
      validationService.calculateTotalPrice.mockResolvedValue(600.0);
      prismaService.booking.create.mockResolvedValue(mockBooking);

      await service.create(dtoWithoutPrice);

      expect(validationService.calculateTotalPrice).toHaveBeenCalledWith(
        'residence-id',
        undefined,
        undefined,
        '2024-06-01T00:00:00Z',
        '2024-06-07T23:59:59Z',
      );
      expect(prismaService.booking.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          totalPrice: 600.0,
        }),
        include: expect.any(Object),
      });
    });

    it('should throw error when validation fails', async () => {
      validationService.validateBooking.mockRejectedValue(
        new BadRequestException('Invalid booking data'),
      );

      await expect(service.create(mockCreateBookingDto)).rejects.toThrow(BadRequestException);
      expect(prismaService.booking.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all bookings', async () => {
      const mockBookings = [mockBooking];
      prismaService.booking.findMany.mockResolvedValue(mockBookings);

      const result = await service.findAll();

      expect(prismaService.booking.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockBookings);
    });
  });

  describe('findOne', () => {
    it('should return a booking by id', async () => {
      prismaService.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await service.findOne('booking-id');

      expect(prismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 'booking-id' },
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
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException when booking not found', async () => {
      prismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should return bookings for a specific user', async () => {
      const mockUserBookings = [mockBooking];
      prismaService.booking.findMany.mockResolvedValue(mockUserBookings);

      const result = await service.findByUser('user-id');

      expect(prismaService.booking.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        include: {
          residence: true,
          vehicle: true,
          offer: true,
          payments: true,
          reviews: true,
        },
      });
      expect(result).toEqual(mockUserBookings);
    });
  });

  describe('update', () => {
    it('should update a booking', async () => {
      const updateDto = { status: 'CONFIRMED' };
      const updatedBooking = { ...mockBooking, status: 'CONFIRMED' };

      prismaService.booking.findUnique.mockResolvedValue(mockBooking);
      prismaService.booking.update.mockResolvedValue(updatedBooking);

      const result = await service.update('booking-id', updateDto);

      expect(prismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 'booking-id' },
        include: expect.any(Object),
      });
      expect(prismaService.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-id' },
        data: updateDto,
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
      expect(result).toEqual(updatedBooking);
    });

    it('should throw NotFoundException when booking not found for update', async () => {
      prismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent-id', {})).rejects.toThrow(NotFoundException);
      expect(prismaService.booking.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a booking', async () => {
      prismaService.booking.findUnique.mockResolvedValue(mockBooking);
      prismaService.booking.delete.mockResolvedValue(mockBooking);

      const result = await service.remove('booking-id');

      expect(prismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 'booking-id' },
        include: expect.any(Object),
      });
      expect(prismaService.booking.delete).toHaveBeenCalledWith({
        where: { id: 'booking-id' },
      });
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException when booking not found for deletion', async () => {
      prismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
      expect(prismaService.booking.delete).not.toHaveBeenCalled();
    });
  });
});
