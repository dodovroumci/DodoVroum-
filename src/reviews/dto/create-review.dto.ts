import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Excellent séjour, je recommande !', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ example: 'user-id-123', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'booking-id-123' })
  @IsString()
  bookingId: string;

  @ApiProperty({ example: 'residence-id-456', required: false })
  @IsOptional()
  @IsString()
  residenceId?: string;

  @ApiProperty({ example: 'vehicle-id-789', required: false })
  @IsOptional()
  @IsString()
  vehicleId?: string;
}
