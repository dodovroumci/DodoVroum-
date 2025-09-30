// src/modules/notifications/notifications.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    // Trouver le owner associé à l'utilisateur
    const owner = await this.prisma.owner.findUnique({
      where: { userId },
    });

    if (!owner) {
      return {
        data: [],
        total: 0,
        unread: 0,
      };
    }

    const notifications = await this.prisma.notification.findMany({
      where: { ownerId: owner.id },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      data: notifications,
      total: notifications.length,
      unread: unreadCount,
    };
  }

  async markAsRead(id: string, userId: string) {
    const owner = await this.prisma.owner.findUnique({
      where: { userId },
    });

    if (!owner) {
      throw new NotFoundException('Owner non trouvé');
    }

    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification non trouvée');
    }

    if (notification.ownerId !== owner.id) {
      throw new ForbiddenException('Accès refusé');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return {
      message: 'Notification marquée comme lue',
      notification: updated,
    };
  }

  async markAllAsRead(userId: string) {
    const owner = await this.prisma.owner.findUnique({
      where: { userId },
    });

    if (!owner) {
      throw new NotFoundException('Owner non trouvé');
    }

    await this.prisma.notification.updateMany({
      where: {
        ownerId: owner.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    return {
      message: 'Toutes les notifications ont été marquées comme lues',
    };
  }

  async remove(id: string, userId: string) {
    const owner = await this.prisma.owner.findUnique({
      where: { userId },
    });

    if (!owner) {
      throw new NotFoundException('Owner non trouvé');
    }

    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification non trouvée');
    }

    if (notification.ownerId !== owner.id) {
      throw new ForbiddenException('Accès refusé');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return {
      message: 'Notification supprimée',
    };
  }

  // Méthode utilitaire pour créer des notifications
  async createNotification(
    ownerId: string,
    type: string,
    message: string,
  ) {
    return this.prisma.notification.create({
      data: {
        ownerId,
        type: type as any,
        message,
      },
    });
  }
}
