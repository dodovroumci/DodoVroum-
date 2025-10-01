// ==========================================
// src/users/users.service.ts
// ==========================================
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Type assertion pour éviter les erreurs any
  private get prismaClient() {
    return this.prisma as any;
  }

  async findAll(): Promise<{ data: Partial<User>[]; total: number }> {
    const users = await this.prismaClient.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: users,
      total: users.length,
    };
  }

  async findOne(id: string) {
    const user = await this.prismaClient.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        reservations: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaClient.user.findUnique({
      where: { email },
    });
  }

  async create(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await this.prismaClient.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: userData.role || 'USER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      message: 'Utilisateur créé avec succès',
      user,
    };
  }

  async update(id: string, updateData: any, currentUserId: string) {
    const user = await this.prismaClient.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier les permissions
    if (id !== currentUserId && !await this.isAdmin(currentUserId)) {
      throw new ForbiddenException('Accès refusé');
    }

    // Si on met à jour le mot de passe, le hasher
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updated = await this.prismaClient.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Utilisateur mis à jour avec succès',
      user: updated,
    };
  }

  async remove(id: string, currentUserId: string) {
    const user = await this.prismaClient.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Seuls les admins peuvent supprimer des utilisateurs
    if (!await this.isAdmin(currentUserId)) {
      throw new ForbiddenException('Accès refusé');
    }

    // Ne pas permettre de se supprimer soi-même
    if (id === currentUserId) {
      throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte');
    }

    await this.prismaClient.user.delete({
      where: { id },
    });

    return {
      message: 'Utilisateur supprimé avec succès',
    };
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private async isAdmin(userId: string): Promise<boolean> {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role === 'ADMIN';
  }

  async getUserStats(userId: string) {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      include: {
        reservations: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const totalReservations = user.reservations.length;
    const totalSpent = user.reservations.reduce((sum, res) => sum + Number(res.totalAmount), 0);
    const averageRating = user.reviews.length > 0 
      ? user.reviews.reduce((sum, review) => sum + review.rating, 0) / user.reviews.length 
      : 0;

    return {
      totalReservations,
      totalSpent,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: user.reviews.length,
    };
  }
}