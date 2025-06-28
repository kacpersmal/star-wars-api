import { SetMetadata } from '@nestjs/common';
import { TypedCacheOptions, TypedInvalidationOptions } from './cache-types';

export const TYPED_CACHE_META = 'TYPED_CACHE_META';
export const TYPED_INVALIDATION_META = 'TYPED_INVALIDATION_META';

// Typed cache decorator
export function TypedCache<
  TClass extends string = string,
  TMethod extends string = string,
>(options: TypedCacheOptions<TClass, TMethod> | number = {}): MethodDecorator {
  const cacheOptions = typeof options === 'number' ? { ttl: options } : options;

  return SetMetadata(TYPED_CACHE_META, cacheOptions);
}

// Typed invalidation decorator
export function TypedInvalidation<
  TClass extends string = string,
  TMethod extends string = string,
>(options: TypedInvalidationOptions<TClass, TMethod>): MethodDecorator {
  return SetMetadata(TYPED_INVALIDATION_META, options);
}

// Convenience decorators for common patterns
export function InvalidateCache(patterns: string[] | string): MethodDecorator {
  const patternsArray = Array.isArray(patterns) ? patterns : [patterns];
  return TypedInvalidation({ patterns: patternsArray });
}

// Specific invalidation decorators
export function InvalidateMethod<
  TClass extends string = string,
  TMethod extends string = string,
>(
  className: TClass,
  methodNames: TMethod | TMethod[],
  keyPrefix?: string,
): MethodDecorator {
  const methods = Array.isArray(methodNames) ? methodNames : [methodNames];
  return TypedInvalidation({ className, methodNames: methods, keyPrefix });
}

export function InvalidatePattern(
  patterns: string | string[],
): MethodDecorator {
  const patternsArray = Array.isArray(patterns) ? patterns : [patterns];
  return TypedInvalidation({ patterns: patternsArray });
}
