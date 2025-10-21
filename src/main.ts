import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { MonitoringInterceptor } from './common/interceptors/monitoring.interceptor';
import { MonitoringModule } from './monitoring/monitoring.module';
import { CacheConfigModule } from './cache/cache.module';
import { LoggingModule } from './logging/logging.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configuration des pipes de validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filtre d'exception global
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Intercepteurs globaux
  app.useGlobalInterceptors(new ResponseInterceptor());
  
  // Intercepteur de monitoring (doit être après ResponseInterceptor)
  const monitoringModule = app.select(MonitoringModule);
  const monitoringInterceptor = monitoringModule.get(MonitoringInterceptor);
  app.useGlobalInterceptors(monitoringInterceptor);

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('DodoVroum API')
    .setDescription('API pour la plateforme de réservation DodoVroum')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification')
    .addTag('users', 'Utilisateurs')
    .addTag('residences', 'Résidences')
    .addTag('vehicles', 'Véhicules')
    .addTag('offers', 'Offres combinées')
    .addTag('bookings', 'Réservations')
    .addTag('payments', 'Paiements')
    .addTag('reviews', 'Avis')
    .addTag('favorites', 'Favoris')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Serveur DodoVroum démarré sur le port ${port}`);
  console.log(`📚 Documentation API disponible sur http://localhost:${port}/api`);
}

bootstrap();
