import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { DatabaseService } from '../../../shared/database/database.service';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private databaseService: DatabaseService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const isConnected = await this.databaseService.checkConnection();

      if (isConnected) {
        return this.getStatus(key, true, {
          message: 'Database connection is healthy',
        });
      }

      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, false),
      );
    } catch (error) {
      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, false, { error: error.message }),
      );
    }
  }
}
