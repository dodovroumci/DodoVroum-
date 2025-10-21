import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ResidencesService } from './residences.service';
import { CreateResidenceDto } from './dto/create-residence.dto';
import { UpdateResidenceDto } from './dto/update-residence.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('residences')
@Controller('residences')
export class ResidencesController {
  constructor(private readonly residencesService: ResidencesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer une résidence' })
  @ApiResponse({ status: 201, description: 'Résidence créée avec succès' })
  create(@Body() createResidenceDto: CreateResidenceDto) {
    return this.residencesService.create(createResidenceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir toutes les résidences avec pagination' })
  @ApiResponse({ status: 200, description: 'Liste paginée des résidences' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.residencesService.findAll(paginationDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Rechercher des résidences' })
  @ApiQuery({ name: 'q', description: 'Terme de recherche' })
  @ApiResponse({ status: 200, description: 'Résultats de recherche' })
  search(@Query('q') query: string) {
    return this.residencesService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une résidence par ID' })
  @ApiResponse({ status: 200, description: 'Résidence trouvée' })
  @ApiResponse({ status: 404, description: 'Résidence non trouvée' })
  findOne(@Param('id') id: string) {
    return this.residencesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour une résidence' })
  @ApiResponse({ status: 200, description: 'Résidence mise à jour' })
  @ApiResponse({ status: 404, description: 'Résidence non trouvée' })
  update(@Param('id') id: string, @Body() updateResidenceDto: UpdateResidenceDto) {
    return this.residencesService.update(id, updateResidenceDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Supprimer une résidence' })
  @ApiResponse({ status: 200, description: 'Résidence supprimée' })
  @ApiResponse({ status: 404, description: 'Résidence non trouvée' })
  remove(@Param('id') id: string) {
    return this.residencesService.remove(id);
  }
}
