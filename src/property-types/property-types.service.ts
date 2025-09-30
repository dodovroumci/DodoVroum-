// src/modules/property-types/property-types.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyTypeDto } from './dto/create-property-type.dto';

@Injectable()
export class PropertyTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const propertyTypes = await this.prisma.propertyType.findMany({
      orderBy: { name: 'asc' },
    });

    return {
      data: propertyTypes,
      total: propertyTypes.length,
    };
  }

  async create(createPropertyTypeDto: CreatePropertyTypeDto) {
    const propertyType = await this.prisma.propertyType.create({
      data: createPropertyTypeDto,
    });

    return {
      message: 'Type de propriété créé avec succès',
      propertyType,
    };
  }

  async remove(id: number) {
    const propertyType = await this.prisma.propertyType.findUnique({
      where: { id },
    });

    if (!propertyType) {
      throw new NotFoundException('Type de propriété non trouvé');
    }

    await this.prisma.propertyType.delete({
      where: { id },
    });

    return {
      message: 'Type de propriété supprimé avec succès',
    };
  }
}


