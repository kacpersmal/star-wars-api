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
      const isConnected = await this.redisService.checkConnection();

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
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, { error: error.message }),
      );
    }
  }
}
