import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ResidencesModule } from './residences/residences.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { OffersModule } from './offers/offers.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requêtes par minute
      },
    ]),
    
    // Base de données
    PrismaModule,
    
    // Modules métier
    AuthModule,
    UsersModule,
    ResidencesModule,
    VehiclesModule,
    OffersModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    FavoritesModule,
  ],
})
export class AppModule {}
