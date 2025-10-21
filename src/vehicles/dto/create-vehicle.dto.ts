import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, IsEnum, Min, IsInt } from 'class-validator';
import { VehicleType } from '@prisma/client';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Camry' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  @Min(1900)
  year: number;

  @ApiProperty({ enum: VehicleType, example: VehicleType.CAR })
  @IsEnum(VehicleType)
  type: VehicleType;

  @ApiProperty({ example: 50.00 })
  @IsNumber()
  @Min(0)
  pricePerDay: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: 'Essence' })
  @IsString()
  fuelType: string;

  @ApiProperty({ example: 'Automatique' })
  @IsString()
  transmission: string;

  @ApiProperty({ example: ['Climatisation', 'GPS', 'Bluetooth', 'Sièges chauffants'] })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({ example: ['https://example.com/car1.jpg', 'https://example.com/car2.jpg'] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
