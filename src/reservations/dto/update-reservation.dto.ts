// src/modules/reservations/dto/update-reservation.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateReservationDto } from './create-reservation.dto';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {}
// ==========================================