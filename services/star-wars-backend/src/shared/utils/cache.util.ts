import { Provider } from '@nestjs/common';
import { TypedCacheProxyFactory } from '../redis/cache/typed-cache-proxy.factory';
import { TypedCacheOptions } from '../redis/cache/cache-types';

export function createCachedProvider(
  token: string,
  serviceClass: any,
  cacheOptions: Partial<TypedCacheOptions> = {},
): Provider {
  const cachedToken = `CACHED_${token}`;

  return {
    provide: cachedToken,
    useFactory: (service: any, factory: TypedCacheProxyFactory) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return factory.createProxy(service, {
        ttl: 300,
        keyPrefix: token.toLowerCase(),
        ...cacheOptions,
      });
    },
    inject: [serviceClass, TypedCacheProxyFactory],
  };
}

export function createCachedProviders(
  configs: Array<{
    token: string;
    serviceClass: any;
    options?: Partial<TypedCacheOptions>;
  }>,
): Provider[] {
  return configs.map(({ token, serviceClass, options }) =>
    createCachedProvider(token, serviceClass, options),
  );
}
