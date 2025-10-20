import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min, Max } from 'class-validator';

export class CreateResidenceDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsNumber()
  @Min(0)
  pricePerNight: number;

  @IsNumber()
  @Min(1)
  maxGuests: number;

  @IsNumber()
  bedrooms: number;

  @IsNumber()
  bathrooms: number;

  @IsOptional()
  @IsArray()
  amenities?: string[];

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsNumber()
  propertyTypeId: number;

  @IsNumber()
  hostId: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean = true;
}
