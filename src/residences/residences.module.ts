import { Module } from '@nestjs/common';
import { ResidencesController } from './residences.controller';
import { ResidencesService } from './residences.service';
import { PaginationService } from '../common/services/pagination.service';

@Module({
  controllers: [ResidencesController],
  providers: [ResidencesService, PaginationService],
})
export class ResidencesModule {}
