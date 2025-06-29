import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/shared/database/database.service';
import { CacheService } from 'src/shared/redis/cache/cache.service';
import { BaseRepository } from 'src/shared/repositories/base.repository';
import { species } from 'src/shared/database/schema';

@Injectable()
export class SpeciesRepository extends BaseRepository<typeof species> {
  constructor(databaseService: DatabaseService, cacheService: CacheService) {
    super(databaseService, cacheService);
  }
}
