import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../redis/cache/cache.service';
import { DrizzleClient } from '../database/drizzle.provider';
import { ReadRepository } from 'src/shared/repositories/interfaces/read-repository';
import { WriteRepository } from 'src/shared/repositories/interfaces/write-repository';
import {
  TypedCache,
  InvalidateCache,
} from '../redis/cache/typed-cache.decorator';
import { eq, and, ilike, sql, type SQL } from 'drizzle-orm';
import { getErrorMessage } from '../utils/error.util';

@Injectable()
export class BaseRepository<T>
  implements ReadRepository<T>, WriteRepository<T>
{
  constructor(
    protected readonly databaseService: DatabaseService,
    protected readonly cacheService: CacheService,
    protected readonly schema?: any,
  ) {}

  @TypedCache({ ttl: 300 })
  async getAll(limit?: number, offset?: number, search?: string): Promise<T[]> {
    if (!this.schema) {
      throw new Error('Schema not provided to repository');
    }

    try {
      const conditions: SQL[] = [];

      // Add search condition if provided and schema has searchable fields
      if (search && this.getSearchableFields().length > 0) {
        const searchConditions = this.getSearchableFields().map((field) =>
          ilike(this.schema[field], `%${search}%`),
        );
        conditions.push(sql`(${sql.join(searchConditions, sql` OR `)})`);
      }

      let query = this.db.select().from(this.schema) as any;

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }

      return await query;
    } catch (error) {
      throw new Error(`Failed to fetch records: ${getErrorMessage(error)}`);
    }
  }

  @TypedCache({ ttl: 300 })
  async getById(id: string): Promise<T | null> {
    if (!this.schema) {
      throw new Error('Schema not provided to repository');
    }

    try {
      const result = await this.db
        .select()
        .from(this.schema)
        .where(eq(this.schema.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw new Error(
        `Failed to fetch record by ID: ${getErrorMessage(error)}`,
      );
    }
  }

  @InvalidateCache([
    `cache:{{this.constructor.name}}:getAll:*`,
    `cache:{{this.constructor.name}}:getById:*`,
  ])
  async create(data: any): Promise<T> {
    if (!this.schema) {
      throw new Error('Schema not provided to repository');
    }

    try {
      console.log(
        'BaseRepository.create - data:',
        JSON.stringify(data, null, 2),
      );
      console.log('BaseRepository.create - data type:', typeof data);
      console.log('BaseRepository.create - schema:', this.schema);

      const result = await this.db.insert(this.schema).values(data).returning();

      return result[0] as T;
    } catch (error) {
      console.error('BaseRepository.create - error:', error);
      throw new Error(`Failed to create record: ${getErrorMessage(error)}`);
    }
  }

  @InvalidateCache([
    `cache:{{this.constructor.name}}:getAll:*`,
    `cache:{{this.constructor.name}}:getById:*`,
  ])
  async update(id: string, data: Partial<T>): Promise<T | null> {
    if (!this.schema) {
      throw new Error('Schema not provided to repository');
    }

    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      const result = await this.db
        .update(this.schema)
        .set(updateData)
        .where(eq(this.schema.id, id))
        .returning();

      return (result[0] as T) || null;
    } catch (error) {
      throw new Error(`Failed to update record: ${getErrorMessage(error)}`);
    }
  }

  @InvalidateCache([
    `cache:{{this.constructor.name}}:getAll:*`,
    `cache:{{this.constructor.name}}:getById:*`,
  ])
  async delete(id: string): Promise<void> {
    if (!this.schema) {
      throw new Error('Schema not provided to repository');
    }

    try {
      await this.db.delete(this.schema).where(eq(this.schema.id, id));
    } catch (error) {
      throw new Error(`Failed to delete record: ${getErrorMessage(error)}`);
    }
  }

  protected get db(): DrizzleClient {
    return this.databaseService.getDb();
  }

  /**
   * Override this method in child classes to specify searchable fields
   * Example: return ['name', 'description']
   */
  protected getSearchableFields(): string[] {
    return [];
  }

  /**
   * Helper method to invalidate all cache entries for this repository
   */
  async invalidateAllCache(): Promise<void> {
    await this.cacheService.invalidateClass(this.constructor.name);
  }
}
