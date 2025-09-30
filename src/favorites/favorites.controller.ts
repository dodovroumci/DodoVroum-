// src/modules/favorites/favorites.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Favoris')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir tous mes favoris' })
  async findAll(@Request() req) {
    return this.favoritesService.findAll(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter aux favoris' })
  async create(@Body() createFavoriteDto: CreateFavoriteDto, @Request() req) {
    return this.favoritesService.create(createFavoriteDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Retirer des favoris' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.favoritesService.remove(id, req.user.id);
  }
}