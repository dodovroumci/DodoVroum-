// ==========================================
// src/users/users.controller.ts
// ==========================================
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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Utilisateurs')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lister tous les utilisateurs' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: any,
    @Request() req,
  ) {
    return this.usersService.update(id, updateUserDto, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(id, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile/me')
  @ApiOperation({ summary: 'Obtenir mon profil' })
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }
}