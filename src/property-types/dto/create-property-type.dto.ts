
// src/modules/property-types/dto/create-property-type.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePropertyTypeDto {
  @ApiProperty({ example: 'Résidence' })
  @IsString()
  name: string;
}