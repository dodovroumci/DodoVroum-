import { Module } from '@nestjs/common';
import { ResidencesService } from './residences.service';
import { ResidencesController } from './residences.controller';
import { PrismaModule } from '../modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ResidencesController],
  providers: [ResidencesService],
})
export class ResidencesModule {}