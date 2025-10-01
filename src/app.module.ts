// ==========================================
// src/app.module.ts
// ==========================================
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ResidencesModule } from './residences/residences.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { CombinedOffersModule } from './combined-offers/combined-offers.module';
import { ReservationsModule } from './reservations/reservations.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PropertyTypesModule } from './property-types/property-types.module';
import { RevenueReportsModule } from './revenue-reports/revenue-reports.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

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