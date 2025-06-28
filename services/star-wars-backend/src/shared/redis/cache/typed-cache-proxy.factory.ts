import { Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CacheService } from './cache.service';
import {
  TYPED_CACHE_META,
  TYPED_INVALIDATION_META,
} from './typed-cache.decorator';
import {
  TypedCacheOptions,
  TypedInvalidationOptions,
  CacheKey,
} from './cache-types';

@Injectable()
export class TypedCacheProxyFactory {
  private readonly logger = new Logger(TypedCacheProxyFactory.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  createProxy<T extends Record<string, unknown>>(
    target: T,
    defaultOptions: Partial<TypedCacheOptions> = { ttl: 60 },
  ): T {
    return new Proxy(target, {
      get: (targetObj: T, propertyKey: string | symbol): unknown => {
        const originalValue = targetObj[propertyKey as keyof T];

        if (typeof originalValue !== 'function') {
          return originalValue;
        }

        const originalMethod = originalValue as (...args: unknown[]) => unknown;

        // Get cache metadata
        const cacheMetadata = this.reflector.get<TypedCacheOptions>(
          TYPED_CACHE_META,
          originalMethod,
        );

        // Get invalidation metadata
        const invalidationMetadata =
          this.reflector.get<TypedInvalidationOptions>(
            TYPED_INVALIDATION_META,
            originalMethod,
          );

        // If neither cache nor invalidation metadata, return original method
        if (!cacheMetadata && !invalidationMetadata) {
          return originalMethod;
        }

        return async (...args: unknown[]): Promise<unknown> => {
          let result: unknown;

          // Handle caching
          if (cacheMetadata) {
            const cacheOptions: TypedCacheOptions = {
              ...defaultOptions,
              ...cacheMetadata,
            };

            const cacheKey = this.generateCacheKey(
              cacheOptions.key || {
                className: target.constructor.name,
                methodName: String(propertyKey),
                keyPrefix: cacheOptions.keyPrefix,
              },
              args,
            );

            result = await this.cacheService.getOrSet(
              cacheKey,
              () => originalMethod.apply(targetObj, args) as Promise<unknown>,
              cacheOptions.ttl || 60,
            );
          } else {
            // Execute method without caching
            result = await originalMethod.apply(targetObj, args);
          }

          // Handle invalidation after method execution
          if (invalidationMetadata) {
            await this.performInvalidation(invalidationMetadata, args, target);
          }

          return result;
        };
      },
    });
  }

  private generateCacheKey(keyConfig: CacheKey, args: unknown[]): string {
    return this.cacheService.generateCacheKey({
      keyPrefix: keyConfig.keyPrefix,
      className: keyConfig.className,
      methodName: keyConfig.methodName,
      args,
    });
  }

  private async performInvalidation(
    options: TypedInvalidationOptions,
    methodArgs: unknown[],
    target: any,
  ): Promise<void> {
    try {
      // Invalidate by patterns
      if (options.patterns) {
        for (const pattern of options.patterns) {
          if (typeof pattern === 'string') {
            await this.cacheService.invalidatePattern(pattern);
          } else if (Array.isArray(pattern)) {
            // Handle CacheKey array
            for (const key of pattern) {
              const cacheKey = this.generateCacheKey(key, methodArgs);
              await this.cacheService.del(cacheKey);
            }
          }
        }
      }

      // Invalidate by className and methodNames
      if (options.className && options.methodNames) {
        const keyPrefix =
          options.keyPrefix ||
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (target.constructor.name as string)
            .toLowerCase()
            .replace('repository', '') + '_repository';

        for (const methodName of options.methodNames) {
          await this.cacheService.invalidateMethod(
            options.className,
            methodName,
            keyPrefix,
          );
        }
      }

      // Invalidate specific keys
      if (options.keys) {
        for (const key of options.keys) {
          const cacheKey = this.generateCacheKey(key, methodArgs);
          await this.cacheService.del(cacheKey);
        }
      }
    } catch (error) {
      this.logger.warn(
        `Failed to invalidate cache: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
