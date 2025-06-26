import { Provider } from '@nestjs/common';
import {
  CacheProxyFactory,
  CacheOptions,
} from '../redis/cache/cache-proxy.factory';

export function createCachedProvider(
  token: string,
  serviceClass: any,
  cacheOptions: Partial<CacheOptions> = {},
): Provider {
  const cachedToken = `CACHED_${token}`;

  return {
    provide: cachedToken,
    useFactory: (service: any, factory: CacheProxyFactory) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return factory.createProxy(service, {
        ttl: 300,
        keyPrefix: token.toLowerCase(),
        ...cacheOptions,
      });
    },
    inject: [serviceClass, CacheProxyFactory],
  };
}

export function createCachedProviders(
  configs: Array<{
    token: string;
    serviceClass: any;
    options?: Partial<CacheOptions>;
  }>,
): Provider[] {
  return configs.map(({ token, serviceClass, options }) =>
    createCachedProvider(token, serviceClass, options),
  );
}
