import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ResidencesService } from './residences.service';
import { CreateResidenceDto } from './dto/create-residence.dto';
import { UpdateResidenceDto } from './dto/update-residence.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('residences')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResidencesController {
  constructor(private readonly residencesService: ResidencesService) {}

  @Post()
  @Roles('admin', 'host')
  create(@Body() createResidenceDto: CreateResidenceDto) {
    return this.residencesService.create(createResidenceDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.residencesService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.residencesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin', 'host')
  update(@Param('id') id: string, @Body() updateResidenceDto: UpdateResidenceDto) {
    return this.residencesService.update(+id, updateResidenceDto);
  }

  @Delete(':id')
  @Roles('admin', 'host')
  remove(@Param('id') id: string) {
    return this.residencesService.remove(+id);
  }
}