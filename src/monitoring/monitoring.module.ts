import { Module } from '@nestjs/common';
import { PrometheusModule } from '@nestjs/prometheus';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'dodovroum_',
        },
      },
      path: '/metrics',
    }),
    HealthModule,
    MetricsModule,
  ],
})
export class MonitoringModule {}
