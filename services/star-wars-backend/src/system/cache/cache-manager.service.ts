import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../../shared/redis/cache/cache.service';

export interface CacheStats {
  totalKeys: number;
  keysByPattern: Record<string, number>;
  lastUpdated: Date;
}

@Injectable()
export class CacheManagerService {
  private readonly logger = new Logger(CacheManagerService.name);

  constructor(private readonly cacheService: CacheService) {}

  async getCacheStats(): Promise<CacheStats> {
    try {
      const allKeys = await this.cacheService.getKeys('*');

      const keysByPattern: Record<string, number> = {};

      allKeys.forEach((key) => {
        const parts = key.split(':');
        const prefix = parts.length > 1 ? parts[0] : 'unknown';
        keysByPattern[prefix] = (keysByPattern[prefix] || 0) + 1;
      });

      return {
        totalKeys: allKeys.length,
        keysByPattern,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to get cache statistics', error);
      return {
        totalKeys: 0,
        keysByPattern: {},
        lastUpdated: new Date(),
      };
    }
  }

  async clearAllCaches(): Promise<boolean> {
    try {
      const success = await this.cacheService.clearAll();

      if (success) {
        this.logger.log('All caches cleared successfully');
      } else {
        this.logger.warn('Failed to clear all caches');
      }

      return success;
    } catch (error) {
      this.logger.error('Error clearing all caches', error);
      return false;
    }
  }

  async clearCachesByPattern(pattern: string): Promise<number> {
    try {
      const clearedCount = await this.cacheService.invalidatePattern(pattern);
      this.logger.log(
        `Cleared ${clearedCount} cache entries matching pattern: ${pattern}`,
      );
      return clearedCount;
    } catch (error) {
      this.logger.error(`Error clearing caches by pattern: ${pattern}`, error);
      return 0;
    }
  }
}
