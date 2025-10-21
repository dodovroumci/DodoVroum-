import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingValidationService } from './services/booking-validation.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, BookingValidationService],
})
export class BookingsModule {}
