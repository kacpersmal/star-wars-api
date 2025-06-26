import { SetMetadata } from '@nestjs/common';

export const CACHEABLE_PROXY_META = 'CACHEABLE_PROXY_META';

export const CacheProxy = (ttl: number = 60): MethodDecorator =>
  SetMetadata(CACHEABLE_PROXY_META, { ttl });
