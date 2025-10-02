// src/modules/revenue-reports/revenue-reports.controller.ts
import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RevenueReportsService } from './revenue-reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Bilan des revenus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER', 'ADMIN')
@Controller('revenue-reports')
export class RevenueReportsController {
  constructor(private readonly revenueReportsService: RevenueReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir le bilan des revenus' })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-12-31' })
  @ApiQuery({ name: 'propertyTypeId', required: false, type: Number })
  async getRevenue(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('propertyTypeId') propertyTypeId?: string,
  ) {
    return this.revenueReportsService.getRevenue(
      req.user.id,
      startDate,
      endDate,
      propertyTypeId ? +propertyTypeId : undefined,
    );
  }

  @Get('summary')
  @ApiOperation({ summary: 'Résumé des revenus par période' })
  async getSummary(@Request() req) {
    return this.revenueReportsService.getSummary(req.user.id);
  }

  @Get('by-property')
  @ApiOperation({ summary: 'Revenus par propriété' })
  async getRevenueByProperty(@Request() req) {
    return this.revenueReportsService.getRevenueByProperty(req.user.id);
  }
}

