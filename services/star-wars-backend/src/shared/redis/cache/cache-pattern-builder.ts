import { CacheKey } from './cache-types';

export class CachePatternBuilder {
  static forClass<TClass extends string>(
    className: TClass,
    keyPrefix?: string,
  ): string {
    const prefix = keyPrefix || '*';
    return `${prefix}:${className}:*`;
  }

  static forMethod<TClass extends string, TMethod extends string>(
    className: TClass,
    methodName: TMethod,
    keyPrefix?: string,
  ): string {
    const prefix = keyPrefix || '*';
    return `${prefix}:${className}:${methodName}:*`;
  }

  static forRepository<TClass extends string>(
    repositoryName: TClass,
  ): {
    findAll: string;
    findOne: (keyPrefix?: string) => string;
    all: string;
  } {
    const repoPrefix = `${repositoryName.toLowerCase()}_repository`;

    return {
      findAll: `*${repoPrefix}:${repositoryName}:findAll:*`,
      findOne: (keyPrefix = repoPrefix) =>
        `${keyPrefix}:${repositoryName}:findOne:*`,
      all: `*${repoPrefix}:${repositoryName}:*`,
    };
  }

  static key<TClass extends string, TMethod extends string>(
    className: TClass,
    methodName: TMethod,
    keyPrefix?: string,
  ): CacheKey<TClass, TMethod> {
    return {
      className,
      methodName,
      keyPrefix,
    };
  }
}

// Type-safe pattern constants
export const CachePatterns = {
  Characters: CachePatternBuilder.forRepository('CharactersRepository'),
  Episodes: CachePatternBuilder.forRepository('EpisodesRepository'),
  Species: CachePatternBuilder.forRepository('SpeciesRepository'),
} as const;

export type CachePatternsType = typeof CachePatterns;
