import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, Min } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty({ example: 'Package Villa + Voiture de luxe' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Offre spéciale villa avec piscine + voiture premium' })
  @IsString()
  description: string;

  @ApiProperty({ example: 200.00 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 15.5, required: false })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({ example: 'residence-id-123' })
  @IsString()
  residenceId: string;

  @ApiProperty({ example: 'vehicle-id-456' })
  @IsString()
  vehicleId: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  validTo: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
