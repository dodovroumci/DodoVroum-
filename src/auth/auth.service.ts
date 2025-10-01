// ==========================================
// src/auth/auth.service.ts
// ==========================================
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../modules/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    });

    // Stocker le refresh token en base
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async register(registerDto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    try {
      const user = await this.usersService.create({
        ...registerDto,
        role: 'USER',
      });

      // Générer un token pour la nouvelle inscription
      const payload = { 
        email: user.user.email, 
        sub: user.user.id,
        role: user.user.role,
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        message: 'Inscription réussie',
        access_token: accessToken,
        user: user.user,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de l\'inscription');
    }
  }

  async logout(userId: string) {
    // Supprimer le refresh token
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return {
      message: 'Déconnexion réussie',
    };
  }

  async refreshToken(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return {
      message: 'Mot de passe modifié avec succès',
    };
  }

  async sendVerificationEmail(userId: string) {
    // Ici vous pourriez intégrer un service d'email comme SendGrid, Nodemailer, etc.
    // Pour l'instant, on simule juste la vérification
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    return {
      message: 'Email de vérification envoyé',
    };
  }

  async verifyEmail(token: string) {
    // Logique de vérification d'email basée sur le token
    // Pour l'instant, on simule juste la vérification
    return {
      message: 'Email vérifié avec succès',
    };
  }
}