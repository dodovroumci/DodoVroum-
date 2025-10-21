import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaginationService, PaginationOptions, PaginationResult } from '../common/services/pagination.service';
import { CacheService } from '../cache/cache.service';
import { AppLoggerService } from '../logging/app-logger.service';
import { CreateResidenceDto } from './dto/create-residence.dto';
import { UpdateResidenceDto } from './dto/update-residence.dto';

@Injectable()
export class ResidencesService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
    private cacheService: CacheService,
    private logger: AppLoggerService,
  ) {}

  async create(createResidenceDto: CreateResidenceDto) {
    const startTime = Date.now();
    
    try {
      const residence = await this.prisma.residence.create({
        data: createResidenceDto,
      });

      // Invalider le cache des résidences
      await this.cacheService.invalidateResidencesCache();

      const duration = Date.now() - startTime;
      this.logger.logDatabaseQuery('CREATE', 'residence', duration, true);
      this.logger.logBusinessEvent('RESIDENCE_CREATED', 'residence', residence.id);

      return residence;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logDatabaseQuery('CREATE', 'residence', duration, false);
      this.logger.error('Failed to create residence', error.stack, 'RESIDENCE_SERVICE');
      throw error;
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginationResult<any>> {
    const { page, limit, sortBy, sortOrder } = this.paginationService.validatePaginationOptions(options);
    
    // Essayer de récupérer depuis le cache
    const cacheKey = { page, limit, sortBy, sortOrder };
    const cachedResult = await this.cacheService.getResidences(page, limit, cacheKey);
    
    if (cachedResult) {
      this.logger.debug('Residences retrieved from cache', 'CACHE');
      return cachedResult;
    }

    const startTime = Date.now();
    const skip = this.paginationService.calculateSkip(page, limit);

    try {
      const [residences, total] = await Promise.all([
        this.prisma.residence.findMany({
          where: { isActive: true },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            title: true,
            description: true,
            address: true,
            city: true,
            country: true,
            pricePerDay: true,
            capacity: true,
            bedrooms: true,
            bathrooms: true,
            amenities: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        }),
        this.prisma.residence.count({
          where: { isActive: true },
        }),
      ]);

      // Calculer la note moyenne de manière optimisée
      const residencesWithRating = await Promise.all(
        residences.map(async (residence) => {
          const avgRating = await this.prisma.review.aggregate({
            where: { residenceId: residence.id },
            _avg: { rating: true },
          });

          return {
            ...residence,
            averageRating: avgRating._avg.rating || 0,
          };
        }),
      );

      const result = {
        data: residencesWithRating,
        pagination: this.paginationService.calculatePaginationMeta(page, limit, total),
      };

      // Mettre en cache le résultat
      await this.cacheService.setResidences(page, limit, result, cacheKey, 300);

      const duration = Date.now() - startTime;
      this.logger.logDatabaseQuery('READ', 'residence', duration, true);
      this.logger.logPerformanceMetric('residences_query_duration', duration);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logDatabaseQuery('READ', 'residence', duration, false);
      this.logger.error('Failed to fetch residences', error.stack, 'RESIDENCE_SERVICE');
      throw error;
    }
  }

  async findOne(id: string) {
    const residence = await this.prisma.residence.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!residence) {
      throw new NotFoundException('Résidence non trouvée');
    }

    return residence;
  }

  async update(id: string, updateResidenceDto: UpdateResidenceDto) {
    await this.findOne(id); // Vérifier que la résidence existe

    return this.prisma.residence.update({
      where: { id },
      data: updateResidenceDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Vérifier que la résidence existe

    return this.prisma.residence.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async search(query: string) {
    return this.prisma.residence.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { city: { contains: query, mode: 'insensitive' } },
              { country: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });
  }
}
