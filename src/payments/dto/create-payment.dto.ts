// src/modules/payments/dto/create-payment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';

enum PaymentMethod {
  MOOV_MONEY = 'MOOV_MONEY',
  MTN_MONEY = 'MTN_MONEY',
  ORANGE_MONEY = 'ORANGE_MONEY',
  WAVE = 'WAVE',
}

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  reservationId: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}