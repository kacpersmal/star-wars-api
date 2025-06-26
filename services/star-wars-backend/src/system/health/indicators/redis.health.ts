import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { RedisService } from '../../../shared/redis/redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private redisService: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const isConnected = await this.redisService.isConnected();

      if (isConnected) {
        return this.getStatus(key, true, {
          message: 'Redis connection is healthy',
        });
      }

      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, { error: errorMessage }),
      );
    }
  }
}
