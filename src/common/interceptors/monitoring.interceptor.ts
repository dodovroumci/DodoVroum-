import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { MetricsService } from '../monitoring/metrics/metrics.service';
import { AppLoggerService } from '../logging/app-logger.service';

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  constructor(
    private metricsService: MetricsService,
    private logger: AppLoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    const method = request.method;
    const route = request.route?.path || request.url;
    const userAgent = request.get('User-Agent');

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Enregistrer les métriques
        this.metricsService.incrementHttpRequests(method, route, statusCode);
        this.metricsService.recordHttpRequestDuration(method, route, duration / 1000);

        // Logger la requête
        this.logger.logHttpRequest(method, route, statusCode, duration, userAgent);

        // Logger les erreurs 4xx et 5xx
        if (statusCode >= 400) {
          this.logger.warn(`HTTP Error ${statusCode}`, 'HTTP', {
            method,
            route,
            statusCode,
            duration: `${duration}ms`,
            userAgent,
            ip: request.ip,
          });
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        // Enregistrer les métriques d'erreur
        this.metricsService.incrementHttpRequests(method, route, statusCode);
        this.metricsService.recordHttpRequestDuration(method, route, duration / 1000);

        // Logger l'erreur
        this.logger.error(`HTTP Error ${statusCode}`, error.stack, 'HTTP', {
          method,
          route,
          statusCode,
          duration: `${duration}ms`,
          userAgent,
          ip: request.ip,
          error: error.message,
        });

        throw error;
      }),
    );
  }
}
