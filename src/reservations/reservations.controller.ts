// src/modules/reservations/reservations.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Réservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir toutes mes réservations' })
  async findAll(@Request() req) {
    return this.reservationsService.findAllByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une réservation par ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.reservationsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle réservation' })
  async create(@Body() createReservationDto: CreateReservationDto, @Request() req) {
    return this.reservationsService.create(createReservationDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une réservation' })
  async update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
    @Request() req,
  ) {
    return this.reservationsService.update(id, updateReservationDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Annuler une réservation' })
  async cancel(@Param('id') id: string, @Request() req) {
    return this.reservationsService.cancel(id, req.user.id);
  }
}