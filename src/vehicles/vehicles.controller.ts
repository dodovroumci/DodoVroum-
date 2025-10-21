import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer un véhicule' })
  @ApiResponse({ status: 201, description: 'Véhicule créé avec succès' })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les véhicules' })
  @ApiResponse({ status: 200, description: 'Liste des véhicules' })
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Rechercher des véhicules' })
  @ApiQuery({ name: 'q', description: 'Terme de recherche' })
  @ApiResponse({ status: 200, description: 'Résultats de recherche' })
  search(@Query('q') query: string) {
    return this.vehiclesService.search(query);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Obtenir les véhicules par type' })
  @ApiResponse({ status: 200, description: 'Liste des véhicules du type spécifié' })
  findByType(@Param('type') type: string) {
    return this.vehiclesService.findByType(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un véhicule par ID' })
  @ApiResponse({ status: 200, description: 'Véhicule trouvé' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour un véhicule' })
  @ApiResponse({ status: 200, description: 'Véhicule mis à jour' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé' })
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  @ApiResponse({ status: 200, description: 'Véhicule supprimé' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé' })
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
