import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';
import { CacheService } from '../../../shared/redis/cache/cache.service';
import { characters } from '../../../shared/database/schema';
import { BaseRepository } from 'src/shared/repositories/base.repository';

@Injectable()
export class CharactersRepository extends BaseRepository<typeof characters> {
  constructor(databaseService: DatabaseService, cacheService: CacheService) {
    super(databaseService, cacheService);
  }
}
