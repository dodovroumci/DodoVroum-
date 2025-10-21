import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    private httpRequestsTotal: Counter<string>,
    
    @InjectMetric('http_request_duration_seconds')
    private httpRequestDuration: Histogram<string>,
    
    @InjectMetric('active_connections')
    private activeConnections: Gauge<string>,
    
    @InjectMetric('database_queries_total')
    private databaseQueriesTotal: Counter<string>,
    
    @InjectMetric('database_query_duration_seconds')
    private databaseQueryDuration: Histogram<string>,
  ) {}

  incrementHttpRequests(method: string, route: string, statusCode: number) {
    this.httpRequestsTotal
      .labels({ method, route, status_code: statusCode.toString() })
      .inc();
  }

  recordHttpRequestDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration
      .labels({ method, route })
      .observe(duration);
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  incrementDatabaseQueries(operation: string, table: string) {
    this.databaseQueriesTotal
      .labels({ operation, table })
      .inc();
  }

  recordDatabaseQueryDuration(operation: string, table: string, duration: number) {
    this.databaseQueryDuration
      .labels({ operation, table })
      .observe(duration);
  }
}
