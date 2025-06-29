import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../redis/cache/cache.service';
import { DrizzleClient } from '../database/drizzle.provider';
import { ReadRepository } from 'src/shared/repositories/interfaces/read-repository';
import { WriteRepository } from 'src/shared/repositories/interfaces/write-repository';
import { ErrorFactory } from '../errors/core/application-error.factory';
import { ErrorDomain } from '../errors/core/error-template';

import { eq, and, ilike, sql, type SQL } from 'drizzle-orm';
import { getErrorMessage } from '../utils/error.util';

export interface CacheConfig {
  enabled?: boolean;
  ttl?: number;
  keyPrefix?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface SearchParams {
  search?: string;
}

@Injectable()
export class BaseRepository<T>
  implements ReadRepository<T>, WriteRepository<T>
{
  private readonly logger = new Logger(BaseRepository.name);
  private readonly defaultCacheConfig: Required<CacheConfig> = {
    enabled: true,
    ttl: 300, // 5 minutes
    keyPrefix: 'repo',
  };

  constructor(
    protected readonly databaseService: DatabaseService,
    protected readonly cacheService: CacheService,
    protected readonly schema?: any,
    private readonly cacheConfig: CacheConfig = {},
  ) {}

  async getAll(limit?: number, offset?: number, search?: string): Promise<T[]> {
    if (!this.schema) {
      throw ErrorFactory.createInternalError(
        'REPOSITORY',
        'Schema not provided to repository',
        { method: 'getAll', repositoryName: this.constructor.name },
      );
    }

    const config = this.getCacheConfig();

    if (config.enabled) {
      const cacheKey = this.generateCacheKey('getAll', {
        limit,
        offset,
        search,
      });

      try {
        return await this.cacheService.getOrSet(
          cacheKey,
          () => this.executeGetAll(limit, offset, search),
          config.ttl,
        );
      } catch (error) {
        this.logger.warn(
          `Cache operation failed for getAll, falling back to database: ${getErrorMessage(error)}`,
        );
        return this.executeGetAll(limit, offset, search);
      }
    }

    return this.executeGetAll(limit, offset, search);
  }

  async getById(id: string): Promise<T | null> {
    if (!this.schema) {
      throw ErrorFactory.createInternalError(
        'REPOSITORY',
        'Schema not provided to repository',
        { method: 'getById', repositoryName: this.constructor.name, id },
      );
    }

    const config = this.getCacheConfig();

    if (config.enabled) {
      const cacheKey = this.generateCacheKey('getById', { id });

      try {
        return await this.cacheService.getOrSet(
          cacheKey,
          () => this.executeGetById(id),
          config.ttl,
        );
      } catch (error) {
        this.logger.warn(
          `Cache operation failed for getById, falling back to database: ${getErrorMessage(error)}`,
        );
        return this.executeGetById(id);
      }
    }

    return this.executeGetById(id);
  }

  async create(data: any): Promise<T> {
    if (!this.schema) {
      throw ErrorFactory.createInternalError(
        'REPOSITORY',
        'Schema not provided to repository',
        { method: 'create', repositoryName: this.constructor.name },
      );
    }

    try {
      const result = await this.db.insert(this.schema).values(data).returning();
      const createdEntity = result[0] as T;

      await this.invalidateCachesAfterWrite('create', createdEntity);

      return createdEntity;
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'REPOSITORY',
        `Failed to create record: ${getErrorMessage(error)}`,
        {
          method: 'create',
          repositoryName: this.constructor.name,
          data,
          originalError: getErrorMessage(error),
        },
      );
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    if (!this.schema) {
      throw ErrorFactory.createInternalError(
        'REPOSITORY',
        'Schema not provided to repository',
        { method: 'update', repositoryName: this.constructor.name, id },
      );
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

      const updatedEntity = (result[0] as T) || null;

      if (updatedEntity) {
        await this.invalidateCachesAfterWrite('update', updatedEntity, id);
      }

      return updatedEntity;
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'REPOSITORY',
        `Failed to update record: ${getErrorMessage(error)}`,
        {
          method: 'update',
          repositoryName: this.constructor.name,
          id,
          data,
          originalError: getErrorMessage(error),
        },
      );
    }
  }

  async delete(id: string): Promise<void> {
    if (!this.schema) {
      throw ErrorFactory.createInternalError(
        'REPOSITORY',
        'Schema not provided to repository',
        { method: 'delete', repositoryName: this.constructor.name, id },
      );
    }

    try {
      await this.db.delete(this.schema).where(eq(this.schema.id, id));

      await this.invalidateCachesAfterWrite('delete', null, id);
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'REPOSITORY',
        `Failed to delete record: ${getErrorMessage(error)}`,
        {
          method: 'delete',
          repositoryName: this.constructor.name,
          id,
          originalError: getErrorMessage(error),
        },
      );
    }
  }

  protected get db(): DrizzleClient {
    return this.databaseService.getDb();
  }

  protected getSearchableFields(): string[] {
    return [];
  }

  async invalidateAllCache(): Promise<void> {
    const config = this.getCacheConfig();
    if (config.enabled) {
      await this.cacheService.invalidateClass(
        this.constructor.name,
        config.keyPrefix,
      );
    }
  }

  private async executeGetAll(
    limit?: number,
    offset?: number,
    search?: string,
  ): Promise<T[]> {
    try {
      const conditions: SQL[] = [];

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
      throw ErrorFactory.createInternalError(
        'REPOSITORY',
        `Failed to fetch records: ${getErrorMessage(error)}`,
        {
          method: 'executeGetAll',
          repositoryName: this.constructor.name,
          limit,
          offset,
          search,
          originalError: getErrorMessage(error),
        },
      );
    }
  }

  private async executeGetById(id: string): Promise<T | null> {
    try {
      const result = await this.db
        .select()
        .from(this.schema)
        .where(eq(this.schema.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'REPOSITORY',
        `Failed to fetch record by ID: ${getErrorMessage(error)}`,
        {
          method: 'executeGetById',
          repositoryName: this.constructor.name,
          id,
          originalError: getErrorMessage(error),
        },
      );
    }
  }

  private generateCacheKey(
    method: string,
    params: Record<string, any>,
  ): string {
    const config = this.getCacheConfig();
    return this.cacheService.generateCacheKey({
      keyPrefix: config.keyPrefix,
      className: this.constructor.name,
      methodName: method,
      args: [params],
    });
  }

  private getCacheConfig(): Required<CacheConfig> {
    return {
      ...this.defaultCacheConfig,
      ...this.cacheConfig,
    };
  }

  private async invalidateCachesAfterWrite(
    operation: 'create' | 'update' | 'delete',
    entity?: T | null,
    id?: string,
  ): Promise<void> {
    const config = this.getCacheConfig();
    if (!config.enabled) {
      return;
    }

    try {
      await this.cacheService.invalidateMethod(
        this.constructor.name,
        'getAll',
        config.keyPrefix,
      );

      if ((operation === 'update' || operation === 'delete') && id) {
        const getByIdCacheKey = this.generateCacheKey('getById', { id });
        await this.cacheService.del(getByIdCacheKey);
      }

      if (operation === 'create' && entity && (entity as any).id) {
        const getByIdCacheKey = this.generateCacheKey('getById', {
          id: (entity as any).id,
        });
        await this.cacheService.set(getByIdCacheKey, entity, config.ttl);
      }

      this.logger.debug(
        `Cache invalidation completed for ${operation} operation in ${this.constructor.name}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache after ${operation} operation: ${getErrorMessage(error)}`,
        {
          operation,
          repositoryName: this.constructor.name,
          entityId: id || (entity as any)?.id,
        },
      );
    }
  }

  async invalidateEntityCache(id: string): Promise<void> {
    const config = this.getCacheConfig();
    if (config.enabled) {
      const cacheKey = this.generateCacheKey('getById', { id });
      await this.cacheService.del(cacheKey);
    }
  }

  async invalidateListCaches(): Promise<void> {
    const config = this.getCacheConfig();
    if (config.enabled) {
      await this.cacheService.invalidateMethod(
        this.constructor.name,
        'getAll',
        config.keyPrefix,
      );
    }
  }
}
