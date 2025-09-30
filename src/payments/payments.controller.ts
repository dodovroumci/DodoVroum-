// src/modules/payments/payments.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Paiements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir tous mes paiements' })
  async findAll(@Request() req) {
    return this.paymentsService.findAllByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un paiement par ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.paymentsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Initier un paiement' })
  async create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    return this.paymentsService.create(createPaymentDto, req.user.id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook de confirmation de paiement' })
  async webhook(@Body() data: any) {
    return this.paymentsService.handleWebhook(data);
  }
}

