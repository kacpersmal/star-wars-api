import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';
import { CacheService } from '../../../shared/redis/cache/cache.service';
import {
  characters,
  type Character,
  type Species,
  type Episode,
} from '../../../shared/database/schema';
import {
  BaseRepository,
  CacheConfig,
} from 'src/shared/repositories/base.repository';

export interface CharacterWithRelations extends Character {
  species?: Species;
  episodes?: Episode[];
}

@Injectable()
export class CharactersRepository extends BaseRepository<Character> {
  constructor(databaseService: DatabaseService, cacheService: CacheService) {
    // Configure caching for characters with 10 minutes TTL
    const cacheConfig: CacheConfig = {
      enabled: true,
      ttl: 600, // 10 minutes
      keyPrefix: 'characters',
    };

    super(databaseService, cacheService, characters, cacheConfig);
  }

  protected getSearchableFields(): string[] {
    return ['name'];
  }
}
