// ==========================================
// src/app.module.ts
// ==========================================
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ResidencesModule } from './modules/residences/residences.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { CombinedOffersModule } from './modules/combined-offers/combined-offers.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PropertyTypesModule } from './modules/property-types/property-types.module';
import { RevenueReportsModule } from './modules/revenue-reports/revenue-reports.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ResidencesModule,
    VehiclesModule,
    CombinedOffersModule,
    ReservationsModule,
    FavoritesModule,
    ReviewsModule,
    PaymentsModule,
    NotificationsModule,
    PropertyTypesModule,
    RevenueReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

   console.log(`🚀 Application est en cours d'exécution sur: http://localhost:${port}/api`);