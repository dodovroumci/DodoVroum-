
// src/modules/reservations/dto/create-reservation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsDateString, IsOptional, IsNumber, Min } from 'class-validator';

enum ReservationType {
  RESIDENCE = 'RESIDENCE',
  VEHICLE = 'VEHICLE',
  COMBINED = 'COMBINED',
}

export class CreateReservationDto {
  @ApiProperty({ enum: ReservationType })
  @IsEnum(ReservationType)
  reservationType: ReservationType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  residenceId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  combinedOfferId?: string;

  @ApiProperty({ example: '2025-10-01' })
  @IsDateString()
  checkInDate: string;

  @ApiProperty({ example: '2025-10-05' })
  @IsDateString()
  checkOutDate: string;

  @ApiProperty({ example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  guestsCount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialRequests?: string;
}