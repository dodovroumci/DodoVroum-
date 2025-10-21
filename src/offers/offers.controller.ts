import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer une offre combinée' })
  @ApiResponse({ status: 201, description: 'Offre créée avec succès' })
  create(@Body() createOfferDto: CreateOfferDto) {
    return this.offersService.create(createOfferDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir toutes les offres' })
  @ApiResponse({ status: 200, description: 'Liste des offres' })
  findAll() {
    return this.offersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une offre par ID' })
  @ApiResponse({ status: 200, description: 'Offre trouvée' })
  @ApiResponse({ status: 404, description: 'Offre non trouvée' })
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour une offre' })
  @ApiResponse({ status: 200, description: 'Offre mise à jour' })
  @ApiResponse({ status: 404, description: 'Offre non trouvée' })
  update(@Param('id') id: string, @Body() updateOfferDto: UpdateOfferDto) {
    return this.offersService.update(id, updateOfferDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Supprimer une offre' })
  @ApiResponse({ status: 200, description: 'Offre supprimée' })
  @ApiResponse({ status: 404, description: 'Offre non trouvée' })
  remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }
}
