import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis.service';
import { getErrorMessage } from '../../utils/error.util';

export interface CacheKeyOptions {
  keyPrefix?: string;
  className?: string;
  methodName?: string;
  args?: unknown[];
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly redisService: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    const redisClient = this.getRedisClient();
    if (!redisClient) {
      this.logger.warn('Redis client not available for get operation');
      return null;
    }

    try {
      const cachedResult = await redisClient.get(key);
      if (cachedResult) {
        this.logger.debug(`Cache hit for key: ${key}`);
        return JSON.parse(cachedResult) as T;
      }

      this.logger.debug(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(
        `Failed to get cache for key: ${key}`,
        getErrorMessage(error),
      );
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = 60): Promise<boolean> {
    const redisClient = this.getRedisClient();
    if (!redisClient) {
      this.logger.warn('Redis client not available for set operation');
      return false;
    }

    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      this.logger.debug(`Cached result for key: ${key} with TTL: ${ttl}s`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to set cache for key: ${key}`,
        getErrorMessage(error),
      );
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    const redisClient = this.getRedisClient();
    if (!redisClient) {
      this.logger.warn('Redis client not available for delete operation');
      return false;
    }

    try {
      await redisClient.del(key);
      this.logger.debug(`Deleted cache entry for key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete cache for key: ${key}`,
        getErrorMessage(error),
      );
      return false;
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = 60,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await factory();

    await this.set(key, result, ttl);

    return result;
  }

  generateCacheKey(options: CacheKeyOptions): string {
    const {
      keyPrefix = 'cache',
      className = '',
      methodName = '',
      args = [],
    } = options;

    if (className && methodName) {
      const argsHash = this.hashArguments(args);
      return `${keyPrefix}:${className}:${methodName}:${argsHash}`;
    }

    const argsHash = args.length > 0 ? this.hashArguments(args) : '';
    return argsHash ? `${keyPrefix}:${argsHash}` : keyPrefix;
  }

  async invalidatePattern(pattern: string): Promise<number> {
    const redisClient = this.getRedisClient();
    if (!redisClient) {
      this.logger.warn(
        'Cannot invalidate cache pattern: Redis client not available',
      );
      return 0;
    }

    try {
      const keys = await redisClient.keys(pattern);

      if (keys.length > 0) {
        await redisClient.del(keys);
        this.logger.debug(
          `Invalidated ${keys.length} cache entries matching pattern: ${pattern}`,
        );
        return keys.length;
      }

      return 0;
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache pattern: ${pattern}`,
        getErrorMessage(error),
      );
      return 0;
    }
  }

  async invalidateClass(
    className: string,
    keyPrefix?: string,
  ): Promise<number> {
    const prefix = keyPrefix || 'cache';
    const pattern = `${prefix}:${className}:*`;
    return this.invalidatePattern(pattern);
  }

  async invalidateMethod(
    className: string,
    methodName: string,
    keyPrefix?: string,
  ): Promise<number> {
    const prefix = keyPrefix || 'cache';
    const pattern = `${prefix}:${className}:${methodName}:*`;
    return this.invalidatePattern(pattern);
  }

  async clearAll(): Promise<boolean> {
    const redisClient = this.getRedisClient();
    if (!redisClient) {
      this.logger.warn('Cannot clear cache: Redis client not available');
      return false;
    }

    try {
      await redisClient.flushDb();
      this.logger.debug('Cleared all cache entries');
      return true;
    } catch (error) {
      this.logger.error(
        'Failed to clear all cache entries',
        getErrorMessage(error),
      );
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    const redisClient = this.getRedisClient();
    if (!redisClient) {
      return false;
    }

    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(
        `Failed to check if key exists: ${key}`,
        getErrorMessage(error),
      );
      return false;
    }
  }

  async getKeys(pattern: string): Promise<string[]> {
    const redisClient = this.getRedisClient();
    if (!redisClient) {
      return [];
    }

    try {
      return await redisClient.keys(pattern);
    } catch (error) {
      this.logger.error(
        `Failed to get keys for pattern: ${pattern}`,
        getErrorMessage(error),
      );
      return [];
    }
  }

  private getRedisClient() {
    try {
      const client = this.redisService.getClient();
      if (!client) {
        this.logger.warn('Redis client is not initialized');
        return null;
      }
      return client;
    } catch (error) {
      this.logger.error('Failed to get Redis client', getErrorMessage(error));
      return null;
    }
  }

  private hashArguments(args: unknown[]): string {
    if (args.length === 0) {
      return 'no-args';
    }

    try {
      const serialized = JSON.stringify(args);
      return Buffer.from(serialized).toString('base64').slice(0, 16);
    } catch (error) {
      this.logger.warn(
        `Failed to serialize arguments for cache key: ${getErrorMessage(error)}`,
      );
      return `args-${args.length}`;
    }
  }
}
