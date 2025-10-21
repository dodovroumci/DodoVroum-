import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, Min, IsInt } from 'class-validator';

export class CreateResidenceDto {
  @ApiProperty({ example: 'Villa de luxe avec piscine' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Magnifique villa avec vue sur mer...' })
  @IsString()
  description: string;

  @ApiProperty({ example: '123 Rue de la Plage' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Nice' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'France' })
  @IsString()
  country: string;

  @ApiProperty({ example: 150.50 })
  @IsNumber()
  @Min(0)
  pricePerDay: number;

  @ApiProperty({ example: 6 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  bedrooms: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  bathrooms: number;

  @ApiProperty({ example: ['WiFi', 'Piscine', 'Parking', 'Climatisation'] })
  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @ApiProperty({ example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
