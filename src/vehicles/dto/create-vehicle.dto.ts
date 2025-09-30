// ==========================================
// src/modules/vehicles/dto/create-vehicle.dto.ts
// ==========================================
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

enum VehicleType {
  VOITURE = 'VOITURE',
  MOTO = 'MOTO',
  CAMION = 'CAMION',
  TRICYCLE = 'TRICYCLE',
}

enum VehicleCategory {
  SUV = 'SUV',
  QUATRE_PAR_QUATRE = 'QUATRE_PAR_QUATRE',
  CITADINE = 'CITADINE',
  BERLINE = 'BERLINE',
}

enum FuelType {
  ESSENCE = 'ESSENCE',
  DIESEL = 'DIESEL',
  ELECTRIQUE = 'ELECTRIQUE',
  HYBRIDE = 'HYBRIDE',
}

enum TransmissionType {
  AUTOMATIQUE = 'AUTOMATIQUE',
  MANUELLE = 'MANUELLE',
}

export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota Corolla 2023' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Véhicule en excellent état, climatisé' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2023 })
  @IsNumber()
  @Min(1900)
  year: number;

  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  type: VehicleType;

  @ApiProperty({ enum: VehicleCategory })
  @IsEnum(VehicleCategory)
  category: VehicleCategory;

  @ApiProperty({ enum: FuelType, required: false })
  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @ApiProperty({ enum: TransmissionType, required: false })
  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @ApiProperty({ example: 35000 })
  @IsNumber()
  @Min(0)
  pricePerDay: number;

  @ApiProperty({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  kmIncluded?: number;

  @ApiProperty({ example: ['url1', 'url2'], required: false })
  @IsOptional()
  images?: any;
}
