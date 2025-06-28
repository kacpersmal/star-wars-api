export type CacheMethodName = string;
export type CacheClassName = string;

// Base cache pattern interface
export interface CachePattern {
  keyPrefix?: string;
  className?: string;
  methodName?: string;
  args?: readonly unknown[];
}

// Type-safe cache key builder
export type CacheKey<
  TClass extends string = string,
  TMethod extends string = string,
> = {
  className: TClass;
  methodName: TMethod;
  keyPrefix?: string;
};

// Pattern matching types
export type PatternMatcher<
  TClass extends string = string,
  TMethod extends string = string,
> = CacheKey<TClass, TMethod>[] | string;

// Invalidation options with typed patterns
export interface TypedInvalidationOptions<
  TClass extends string = string,
  TMethod extends string = string,
> {
  patterns?: PatternMatcher<TClass, TMethod>[];
  keys?: CacheKey<TClass, TMethod>[];
  className?: TClass;
  methodNames?: TMethod[];
  keyPrefix?: string;
}

// Cache proxy options with typed keys
export interface TypedCacheOptions<
  TClass extends string = string,
  TMethod extends string = string,
> {
  ttl?: number;
  keyPrefix?: string;
  key?: CacheKey<TClass, TMethod>;
}
