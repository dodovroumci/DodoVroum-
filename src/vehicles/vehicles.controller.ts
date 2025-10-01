
// ==========================================
// src/modules/vehicles/vehicles.controller.ts
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
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Véhicules')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lister tous les véhicules' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.vehiclesService.findAll(+page, +limit);
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Rechercher des véhicules' })
  @ApiQuery({ name: 'brand', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'price_min', required: false, type: Number })
  @ApiQuery({ name: 'price_max', required: false, type: Number })
  async search(
    @Query('brand') brand?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('price_min') priceMin?: string,
    @Query('price_max') priceMax?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.vehiclesService.search({
      brand,
      type,
      category,
      priceMin: priceMin ? +priceMin : undefined,
      priceMax: priceMax ? +priceMax : undefined,
      page: +page,
      limit: +limit,
    });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un véhicule par ID' })
  async findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Post()
  @ApiOperation({ summary: 'Créer un nouveau véhicule' })
  async create(@Body() createVehicleDto: CreateVehicleDto, @Request() req) {
    return this.vehiclesService.create(createVehicleDto, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un véhicule' })
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @Request() req,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.vehiclesService.remove(id, req.user.id);
  }
}

