
// ==========================================
// PROPERTY-TYPES MODULE
// ==========================================

// src/modules/property-types/property-types.module.ts
import { Module } from '@nestjs/common';
import { PropertyTypesController } from './property-types.controller';
import { PropertyTypesService } from './property-types.service';

@Module({
  controllers: [PropertyTypesController],
  providers: [PropertyTypesService],
})
export class PropertyTypesModule {}

