import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../redis/cache/cache.service';
import * as schema from '../database/schema';

@Injectable()
export abstract class AbstractRepository {
  constructor(
    protected readonly databaseService: DatabaseService,
    protected readonly cacheService: CacheService,
  ) {}

  /**
   * Get the database instance
   */
  protected get db(): NodePgDatabase<typeof schema> {
    return this.databaseService.getDb();
  }
}
