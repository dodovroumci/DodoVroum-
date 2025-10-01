// ==========================================
// src/residences/residences.controller.ts
// ==========================================
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ResidencesService } from './residences.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Résidences')
@Controller('residences')
export class ResidencesController {
  constructor(private readonly residencesService: ResidencesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lister toutes les résidences' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'propertyType', required: false })
  @ApiQuery({ name: 'price_min', required: false, type: Number })
  @ApiQuery({ name: 'price_max', required: false, type: Number })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('city') city?: string,
    @Query('propertyType') propertyType?: string,
    @Query('price_min') priceMin?: string,
    @Query('price_max') priceMax?: string,
  ) {
    return this.residencesService.findAll(+page, +limit, {
      city,
      propertyType,
      priceMin: priceMin ? +priceMin : undefined,
      priceMax: priceMax ? +priceMax : undefined,
    });
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Rechercher des résidences' })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'propertyType', required: false })
  @ApiQuery({ name: 'price_min', required: false, type: Number })
  @ApiQuery({ name: 'price_max', required: false, type: Number })
  @ApiQuery({ name: 'amenities', required: false })
  async search(
    @Query('city') city?: string,
    @Query('propertyType') propertyType?: string,
    @Query('price_min') priceMin?: string,
    @Query('price_max') priceMax?: string,
    @Query('amenities') amenities?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.residencesService.search({
      city,
      propertyType,
      priceMin: priceMin ? +priceMin : undefined,
      priceMax: priceMax ? +priceMax : undefined,
      amenities: amenities ? amenities.split(',') : undefined,
      page: +page,
      limit: +limit,
    });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une résidence par ID' })
  async findOne(@Param('id') id: string) {
    return this.residencesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle résidence' })
  async create(@Body() createResidenceDto: any, @Request() req) {
    return this.residencesService.create(createResidenceDto, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une résidence' })
  async update(
    @Param('id') id: string,
    @Body() updateResidenceDto: any,
    @Request() req,
  ) {
    return this.residencesService.update(id, updateResidenceDto, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une résidence' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.residencesService.remove(id, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-residences')
  @ApiOperation({ summary: 'Obtenir mes résidences' })
  async getMyResidences(@Request() req) {
    return this.residencesService.findByOwner(req.user.id);
  }
}