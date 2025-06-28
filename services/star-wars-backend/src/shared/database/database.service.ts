import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE, DrizzleClient } from './drizzle.provider';
import { ErrorFactory } from '../errors/core/application-error.factory';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(
    @Inject(DRIZZLE)
    private db: DrizzleClient,
  ) {}

  async onModuleDestroy() {}

  getDb(): DrizzleClient {
    if (!this.db) {
      throw ErrorFactory.createInternalError(
        'DATABASE',
        'Database not initialized. Make sure DatabaseService has been properly injected.',
      );
    }
    return this.db;
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.db.execute(sql`SELECT 1`);
      return true;
    } catch {
      return false;
    }
  }
}
