import { Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CACHEABLE_PROXY_META } from './cache-proxy.decorator';
import { CacheService } from './cache.service';

export interface CacheOptions {
  ttl: number;
  keyPrefix?: string;
}

@Injectable()
export class CacheProxyFactory {
  private readonly logger = new Logger(CacheProxyFactory.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  createProxy<T extends Record<string, unknown>>(
    target: T,
    defaultOptions: CacheOptions = { ttl: 60 },
  ): T {
    return new Proxy(target, {
      get: (targetObj: T, propertyKey: string | symbol): unknown => {
        const originalValue = targetObj[propertyKey as keyof T];

        if (typeof originalValue !== 'function') {
          return originalValue;
        }

        const originalMethod = originalValue as (...args: unknown[]) => unknown;

        const cacheMetadata = this.reflector.get<Partial<CacheOptions>>(
          CACHEABLE_PROXY_META,
          originalMethod,
        );

        if (!cacheMetadata) {
          return originalMethod;
        }

        const options: CacheOptions = {
          ...defaultOptions,
          ...cacheMetadata,
        };

        return async (...args: unknown[]): Promise<unknown> => {
          const cacheKey = this.cacheService.generateCacheKey({
            className: target.constructor.name,
            methodName: String(propertyKey),
            args,
            keyPrefix: options.keyPrefix,
          });

          return this.cacheService.getOrSet(
            cacheKey,
            () => originalMethod.apply(targetObj, args) as Promise<unknown>,
            options.ttl,
          );
        };
      },
    });
  }

  async invalidatePattern(pattern: string): Promise<number> {
    return this.cacheService.invalidatePattern(pattern);
  }

  async invalidateClass(
    className: string,
    keyPrefix?: string,
  ): Promise<number> {
    return this.cacheService.invalidateClass(className, keyPrefix);
  }

  async invalidateMethod(
    className: string,
    methodName: string,
    keyPrefix?: string,
  ): Promise<number> {
    return this.cacheService.invalidateMethod(className, methodName, keyPrefix);
  }

  async clearAll(): Promise<boolean> {
    return this.cacheService.clearAll();
  }
}
