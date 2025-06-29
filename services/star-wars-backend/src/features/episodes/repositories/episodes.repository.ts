import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/shared/database/database.service';
import { CacheService } from 'src/shared/redis/cache/cache.service';
import {
  BaseRepository,
  CacheConfig,
} from 'src/shared/repositories/base.repository';
import { episodes, type Episode } from 'src/shared/database/schema';

@Injectable()
export class EpisodesRepository extends BaseRepository<Episode> {
  constructor(databaseService: DatabaseService, cacheService: CacheService) {
    // Configure caching for episodes with 15 minutes TTL (episodes change less frequently)
    const cacheConfig: CacheConfig = {
      enabled: true,
      ttl: 900, // 15 minutes
      keyPrefix: 'episodes',
    };

    super(databaseService, cacheService, episodes, cacheConfig);
  }

  protected getSearchableFields(): string[] {
    return ['title', 'name'];
  }
}
