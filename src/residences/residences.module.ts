// ==========================================
// src/residences/residences.module.ts
// ==========================================
import { Module } from '@nestjs/common';
import { ResidencesController } from './residences.controller';
import { ResidencesService } from './residences.service';
import { PrismaModule } from '../modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ResidencesController],
  providers: [ResidencesService],
  exports: [ResidencesService],
})
export class ResidencesModule {}