import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../redis/cache/cache.service';
import { DrizzleClient } from '../database/drizzle.provider';

@Injectable()
export abstract class AbstractRepository {
  constructor(
    protected readonly databaseService: DatabaseService,
    protected readonly cacheService: CacheService,
  ) {}

  protected get db(): DrizzleClient {
    return this.databaseService.getDb();
  }
}
