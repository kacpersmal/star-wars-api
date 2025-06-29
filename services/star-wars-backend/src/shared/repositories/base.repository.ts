import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../redis/cache/cache.service';
import { DrizzleClient } from '../database/drizzle.provider';
import { ReadRepository } from 'src/shared/repositories/interfaces/read-repository';
import { WriteRepository } from 'src/shared/repositories/interfaces/write-repository';

@Injectable()
export class BaseRepository<T>
  implements ReadRepository<T>, WriteRepository<T>
{
  constructor(
    protected readonly databaseService: DatabaseService,
    protected readonly cacheService: CacheService,
  ) {}

  getAll(limit?: number, offset?: number, search?: string): Promise<T[]> {
    throw new Error('Method not implemented.');
  }
  getById(id: string): Promise<T | null> {
    throw new Error('Method not implemented.');
  }

  create(data: T): Promise<T> {
    throw new Error('Method not implemented.');
  }
  update(id: string, data: Partial<T>): Promise<T | null> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected get db(): DrizzleClient {
    return this.databaseService.getDb();
  }
}
