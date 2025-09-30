
// src/modules/combined-offers/dto/create-combined-offer.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';

enum PackageType {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  LUXE = 'LUXE',
}

export class CreateCombinedOfferDto {
  @ApiProperty({ example: 'Séjour + Voiture - Abidjan' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Package complet pour vos vacances' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  residenceId?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiProperty({ enum: PackageType })
  @IsEnum(PackageType)
  packageType: PackageType;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiProperty({ example: 10, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiProperty({ example: 7 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationDays?: number;
}

