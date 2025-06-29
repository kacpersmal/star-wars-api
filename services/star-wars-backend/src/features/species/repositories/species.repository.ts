import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/shared/database/database.service';
import { CacheService } from 'src/shared/redis/cache/cache.service';
import {
  BaseRepository,
  CacheConfig,
} from 'src/shared/repositories/base.repository';
import { species, type Species } from 'src/shared/database/schema';

@Injectable()
export class SpeciesRepository extends BaseRepository<Species> {
  constructor(databaseService: DatabaseService, cacheService: CacheService) {
    // Configure caching for species with 20 minutes TTL (species change rarely)
    const cacheConfig: CacheConfig = {
      enabled: true,
      ttl: 1200, // 20 minutes
      keyPrefix: 'species',
    };

    super(databaseService, cacheService, species, cacheConfig);
  }

  protected getSearchableFields(): string[] {
    return ['name'];
  }
}
