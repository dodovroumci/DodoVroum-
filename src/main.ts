// ==========================================
// src/main.ts
// ==========================================
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS
  app.enableCors({
    origin: '*', // À modifier en production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Préfixe global
  app.setGlobalPrefix('api');

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('DodoVroum & CombotripCI API')
    .setDescription('API Backend pour réservation et location en Côte d\'Ivoire')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentification')
    .addTag('Utilisateurs')
    .addTag('Résidences')
    .addTag('Véhicules')
    .addTag('Offres combinées')
    .addTag('Réservations')
    .addTag('Favoris')
    .addTag('Avis')
    .addTag('Paiements')
    .addTag('Notifications')
    .addTag('Types de propriétés')
    .addTag('Bilan des revenus')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 Application démarrée avec succès !');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📍 URL locale        : http://localhost:${port}`);
  console.log(`📚 Documentation API : http://localhost:${port}/api/docs`);
  console.log(`🔐 Environnement     : ${process.env.NODE_ENV || 'development'}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
}

bootstrap();