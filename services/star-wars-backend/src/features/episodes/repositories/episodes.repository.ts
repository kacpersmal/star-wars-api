import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/shared/database/database.service';
import { CacheService } from 'src/shared/redis/cache/cache.service';
import { BaseRepository } from 'src/shared/repositories/base.repository';
import { episodes, type Episode } from 'src/shared/database/schema';

@Injectable()
export class EpisodesRepository extends BaseRepository<Episode> {
  constructor(databaseService: DatabaseService, cacheService: CacheService) {
    super(databaseService, cacheService, episodes);
  }

  protected getSearchableFields(): string[] {
    return ['title', 'name'];
  }
}
