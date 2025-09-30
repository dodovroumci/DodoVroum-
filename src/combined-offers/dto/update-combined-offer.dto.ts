// src/modules/combined-offers/dto/update-combined-offer.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateCombinedOfferDto } from './create-combined-offer.dto';

export class UpdateCombinedOfferDto extends PartialType(CreateCombinedOfferDto) {}
