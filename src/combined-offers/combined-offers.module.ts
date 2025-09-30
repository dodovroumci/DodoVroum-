// ==========================================
// COMBINED-OFFERS MODULE
// ==========================================

// src/modules/combined-offers/combined-offers.module.ts
import { Module } from '@nestjs/common';
import { CombinedOffersController } from './combined-offers.controller';
import { CombinedOffersService } from './combined-offers.service';

@Module({
  controllers: [CombinedOffersController],
  providers: [CombinedOffersService],
})
export class CombinedOffersModule {}