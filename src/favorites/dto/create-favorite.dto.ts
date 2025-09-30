// src/modules/favorites/dto/create-favorite.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateFavoriteDto {
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
}
