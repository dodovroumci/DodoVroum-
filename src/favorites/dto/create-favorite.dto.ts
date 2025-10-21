import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateFavoriteDto {
  @ApiProperty({ example: 'user-id-123', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'residence-id-123', required: false })
  @IsOptional()
  @IsString()
  residenceId?: string;

  @ApiProperty({ example: 'vehicle-id-456', required: false })
  @IsOptional()
  @IsString()
  vehicleId?: string;
}
