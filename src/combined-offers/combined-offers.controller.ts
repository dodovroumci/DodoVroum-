// src/modules/combined-offers/combined-offers.controller.ts
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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CombinedOffersService } from './combined-offers.service';
import { CreateCombinedOfferDto } from './dto/create-combined-offer.dto';
import { UpdateCombinedOfferDto } from './dto/update-combined-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Offres combinées')
@Controller('combined-offers')
export class CombinedOffersController {
  constructor(private readonly combinedOffersService: CombinedOffersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lister toutes les offres combinées' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.combinedOffersService.findAll(+page, +limit);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une offre combinée par ID' })
  async findOne(@Param('id') id: string) {
    return this.combinedOffersService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Créer une offre combinée' })
  async create(@Body() createCombinedOfferDto: CreateCombinedOfferDto) {
    return this.combinedOffersService.create(createCombinedOfferDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une offre combinée' })
  async update(
    @Param('id') id: string,
    @Body() updateCombinedOfferDto: UpdateCombinedOfferDto,
  ) {
    return this.combinedOffersService.update(id, updateCombinedOfferDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une offre combinée' })
  async remove(@Param('id') id: string) {
    return this.combinedOffersService.remove(id);
  }
}