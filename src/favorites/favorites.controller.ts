import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Ajouter aux favoris' })
  @ApiResponse({ status: 201, description: 'Ajouté aux favoris avec succès' })
  create(@Body() createFavoriteDto: CreateFavoriteDto, @Request() req) {
    return this.favoritesService.create({
      ...createFavoriteDto,
      userId: req.user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les favoris' })
  @ApiResponse({ status: 200, description: 'Liste des favoris' })
  findAll() {
    return this.favoritesService.findAll();
  }

  @Get('my-favorites')
  @ApiOperation({ summary: 'Obtenir mes favoris' })
  @ApiResponse({ status: 200, description: 'Liste de mes favoris' })
  findMyFavorites(@Request() req) {
    return this.favoritesService.findByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un favori par ID' })
  @ApiResponse({ status: 200, description: 'Favori trouvé' })
  @ApiResponse({ status: 404, description: 'Favori non trouvé' })
  findOne(@Param('id') id: string) {
    return this.favoritesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer des favoris' })
  @ApiResponse({ status: 200, description: 'Supprimé des favoris' })
  @ApiResponse({ status: 404, description: 'Favori non trouvé' })
  remove(@Param('id') id: string) {
    return this.favoritesService.remove(id);
  }

  @Delete('residence/:residenceId')
  @ApiOperation({ summary: 'Supprimer une résidence des favoris' })
  @ApiResponse({ status: 200, description: 'Résidence supprimée des favoris' })
  removeResidence(@Param('residenceId') residenceId: string, @Request() req) {
    return this.favoritesService.removeByUserAndItem(req.user.id, residenceId);
  }

  @Delete('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Supprimer un véhicule des favoris' })
  @ApiResponse({ status: 200, description: 'Véhicule supprimé des favoris' })
  removeVehicle(@Param('vehicleId') vehicleId: string, @Request() req) {
    return this.favoritesService.removeByUserAndItem(req.user.id, undefined, vehicleId);
  }
}
