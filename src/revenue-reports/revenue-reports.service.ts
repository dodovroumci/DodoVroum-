// src/modules/revenue-reports/revenue-reports.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';

@Injectable()
export class RevenueReportsService {
  constructor(private prisma: PrismaService) {}

  async getRevenue(
    userId: string,
    startDate?: string,
    endDate?: string,
    propertyTypeId?: number,
  ) {
    // Trouver le owner
    const owner = await this.prisma.owner.findUnique({
      where: { userId },
      include: {
        properties: true,
      },
    });

    if (!owner) {
      throw new NotFoundException('Propriétaire non trouvé');
    }

    const propertyIds = owner.properties.map((p) => p.id);

    // Construire le filtre de date
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Construire le filtre de type de propriété
    const propertyFilter: any = { id: { in: propertyIds } };
    if (propertyTypeId) {
      propertyFilter.propertyTypeId = propertyTypeId;
    }

    // Trouver les propriétés correspondantes
    const filteredProperties = await this.prisma.property.findMany({
      where: propertyFilter,
    });

    const filteredPropertyIds = filteredProperties.map((p) => p.id);

    // Trouver les réservations (bookings) correspondantes
    const bookings = await this.prisma.booking.findMany({
      where: {
        propertyId: { in: filteredPropertyIds },
        ...(Object.keys(dateFilter).length > 0 && {
          startDate: dateFilter,
        }),
      },
      include: {
        property: {
          include: {
            propertyType: true,
          },
        },
        payments: {
          where: { status: 'PAID' },
        },
      },
    });

    // Calculer les revenus
    let totalRevenue = 0;
    const revenueByProperty: any = {};
    const revenueByType: any = {};

    bookings.forEach((booking) => {
      const paidPayments = booking.payments.filter((p) => p.status === 'PAID');
      const bookingRevenue = paidPayments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0,
      );

      totalRevenue += bookingRevenue;

      // Par propriété
      if (!revenueByProperty[booking.propertyId]) {
        revenueByProperty[booking.propertyId] = {
          propertyTitle: booking.property.title,
          revenue: 0,
          bookingsCount: 0,
        };
      }
      revenueByProperty[booking.propertyId].revenue += bookingRevenue;
      revenueByProperty[booking.propertyId].bookingsCount += 1;

      // Par type
      const typeName = booking.property.propertyType.name;
      if (!revenueByType[typeName]) {
        revenueByType[typeName] = {
          revenue: 0,
          bookingsCount: 0,
        };
      }
      revenueByType[typeName].revenue += bookingRevenue;
      revenueByType[typeName].bookingsCount += 1;
    });

    return {
      totalRevenue,
      totalBookings: bookings.length,
      period: {
        startDate: startDate || 'Début',
        endDate: endDate || 'Aujourd\'hui',
      },
      revenueByProperty: Object.entries(revenueByProperty).map(
        ([id, data]: any) => ({
          propertyId: id,
          ...data,
        }),
      ),
      revenueByType: Object.entries(revenueByType).map(([type, data]: any) => ({
        type,
        ...data,
      })),
    };
  }

  async getSummary(userId: string) {
    const owner = await this.prisma.owner.findUnique({
      where: { userId },
      include: {
        properties: true,
      },
    });

    if (!owner) {
      throw new NotFoundException('Propriétaire non trouvé');
    }

    const propertyIds = owner.properties.map((p) => p.id);

    // Revenus du mois en cours
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyBookings = await this.prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIds },
        startDate: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      include: {
        payments: {
          where: { status: 'PAID' },
        },
      },
    });

    const monthlyRevenue = monthlyBookings.reduce((sum, booking) => {
      return (
        sum +
        booking.payments.reduce((s, p) => s + Number(p.amount), 0)
      );
    }, 0);

    // Revenus de l'année en cours
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const yearlyBookings = await this.prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIds },
        startDate: {
          gte: firstDayOfYear,
        },
      },
      include: {
        payments: {
          where: { status: 'PAID' },
        },
      },
    });

    const yearlyRevenue = yearlyBookings.reduce((sum, booking) => {
      return (
        sum +
        booking.payments.reduce((s, p) => s + Number(p.amount), 0)
      );
    }, 0);

    // Revenus totaux
    const allBookings = await this.prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIds },
      },
      include: {
        payments: {
          where: { status: 'PAID' },
        },
      },
    });

    const totalRevenue = allBookings.reduce((sum, booking) => {
      return (
        sum +
        booking.payments.reduce((s, p) => s + Number(p.amount), 0)
      );
    }, 0);

    return {
      monthly: {
        revenue: monthlyRevenue,
        bookings: monthlyBookings.length,
      },
      yearly: {
        revenue: yearlyRevenue,
        bookings: yearlyBookings.length,
      },
      total: {
        revenue: totalRevenue,
        bookings: allBookings.length,
      },
      propertiesCount: owner.properties.length,
    };
  }

  async getRevenueByProperty(userId: string) {
    const owner = await this.prisma.owner.findUnique({
      where: { userId },
      include: {
        properties: {
          include: {
            propertyType: true,
            bookings: {
              include: {
                payments: {
                  where: { status: 'PAID' },
                },
              },
            },
          },
        },
      },
    });

    if (!owner) {
      throw new NotFoundException('Propriétaire non trouvé');
    }

    const propertiesRevenue = owner.properties.map((property) => {
      const revenue = property.bookings.reduce((sum, booking) => {
        return (
          sum +
          booking.payments.reduce((s, p) => s + Number(p.amount), 0)
        );
      }, 0);

      return {
        propertyId: property.id,
        propertyTitle: property.title,
        propertyType: property.propertyType.name,
        revenue,
        bookingsCount: property.bookings.length,
        status: property.status,
      };
    });

    return {
      data: propertiesRevenue,
      total: propertiesRevenue.length,
    };
  }
}