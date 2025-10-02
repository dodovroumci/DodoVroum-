// src/modules/payments/payments.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    // Trouver toutes les réservations de l'utilisateur
    const reservations = await this.prisma.reservation.findMany({
      where: { userId },
      select: { id: true },
    });

    const reservationIds = reservations.map((r) => r.id);

    const payments = await this.prisma.payment.findMany({
      where: {
        reservationId: { in: reservationIds },
      },
      include: {
        reservation: {
          include: {
            residence: true,
            vehicle: true,
            combinedOffer: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: payments,
      total: payments.length,
    };
  }

  async findOne(id: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        reservation: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Paiement non trouvé');
    }

    // Vérifier que le paiement appartient à l'utilisateur
    if (payment.reservation && payment.reservation.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    return payment;
  }

  async create(createPaymentDto: CreatePaymentDto, userId: string) {
    const { reservationId, paymentMethod } = createPaymentDto;

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    if (reservation.paymentStatus === 'PAID') {
      throw new BadRequestException('Cette réservation est déjà payée');
    }

    // Créer le paiement
    const payment = await this.prisma.payment.create({
      data: {
        reservationId,
        amount: reservation.totalAmount,
        paymentMethod,
        status: 'PENDING',
      },
    });

    // TODO: Intégrer avec les API de paiement (Moov, MTN, Orange, Wave)
    // Générer le lien de paiement selon le provider choisi

    return {
      message: 'Paiement initié avec succès',
      payment,
      paymentUrl: 'https://payment-gateway.example.com/pay/' + payment.id,
    };
  }

  async handleWebhook(data: any) {
    // TODO: Vérifier la signature du webhook
    // TODO: Traiter les différents événements (success, failed, etc.)

    const { paymentId, status } = data;

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Paiement non trouvé');
    }

    // Mettre à jour le statut du paiement
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: status === 'success' ? 'PAID' : 'FAILED' },
    });

    // Mettre à jour le statut de la réservation
    if (status === 'success' && payment.reservationId) {
      await this.prisma.reservation.update({
        where: { id: payment.reservationId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
        },
      });
    }

    return {
      message: 'Webhook traité avec succès',
      payment: updatedPayment,
    };
  }
}