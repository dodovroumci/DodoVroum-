import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer un utilisateur admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dodovroum.com' },
    update: {},
    create: {
      email: 'admin@dodovroum.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'DodoVroum',
      role: 'ADMIN',
    },
  });

  // Créer un utilisateur client
  const clientPassword = await bcrypt.hash('client123', 10);
  const client = await prisma.user.upsert({
    where: { email: 'client@dodovroum.com' },
    update: {},
    create: {
      email: 'client@dodovroum.com',
      password: clientPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '+33123456789',
      role: 'CLIENT',
    },
  });

  // Créer des résidences d'exemple
  const residence1 = await prisma.residence.create({
    data: {
      title: 'Villa de luxe avec piscine',
      description: 'Magnifique villa avec vue sur mer, piscine privée et jardin paysager.',
      address: '123 Promenade des Anglais',
      city: 'Nice',
      country: 'France',
      pricePerDay: 250.00,
      capacity: 8,
      bedrooms: 4,
      bathrooms: 3,
      amenities: ['WiFi', 'Piscine', 'Parking', 'Climatisation', 'Cuisine équipée', 'Jardin'],
      images: [
        'https://example.com/villa1-1.jpg',
        'https://example.com/villa1-2.jpg',
        'https://example.com/villa1-3.jpg',
      ],
    },
  });

  const residence2 = await prisma.residence.create({
    data: {
      title: 'Appartement moderne en centre-ville',
      description: 'Appartement moderne et confortable en plein cœur de la ville.',
      address: '45 Rue de la République',
      city: 'Lyon',
      country: 'France',
      pricePerDay: 120.00,
      capacity: 4,
      bedrooms: 2,
      bathrooms: 1,
      amenities: ['WiFi', 'Climatisation', 'Ascenseur', 'Balcon'],
      images: [
        'https://example.com/apt1-1.jpg',
        'https://example.com/apt1-2.jpg',
      ],
    },
  });

  // Créer des véhicules d'exemple
  const vehicle1 = await prisma.vehicle.create({
    data: {
      brand: 'BMW',
      model: 'X5',
      year: 2023,
      type: 'CAR',
      pricePerDay: 80.00,
      capacity: 5,
      fuelType: 'Essence',
      transmission: 'Automatique',
      features: ['Climatisation', 'GPS', 'Bluetooth', 'Sièges chauffants', 'Caméra de recul'],
      images: [
        'https://example.com/bmw-x5-1.jpg',
        'https://example.com/bmw-x5-2.jpg',
      ],
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      type: 'CAR',
      pricePerDay: 45.00,
      capacity: 5,
      fuelType: 'Hybride',
      transmission: 'Automatique',
      features: ['Climatisation', 'GPS', 'Bluetooth'],
      images: [
        'https://example.com/toyota-corolla-1.jpg',
        'https://example.com/toyota-corolla-2.jpg',
      ],
    },
  });

  // Créer une offre combinée
  const offer = await prisma.offer.create({
    data: {
      title: 'Package Villa + BMW X5',
      description: 'Offre spéciale : Villa de luxe avec BMW X5 inclus',
      price: 300.00,
      discount: 20.0,
      residenceId: residence1.id,
      vehicleId: vehicle1.id,
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2024-12-31'),
    },
  });

  console.log('✅ Seeding terminé avec succès !');
  console.log(`👤 Admin créé : ${admin.email}`);
  console.log(`👤 Client créé : ${client.email}`);
  console.log(`🏠 ${2} résidences créées`);
  console.log(`🚗 ${2} véhicules créés`);
  console.log(`🎁 ${1} offre créée`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
