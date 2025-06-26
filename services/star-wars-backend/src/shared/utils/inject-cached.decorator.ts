import { Inject } from '@nestjs/common';

export const InjectCached = (token: string) => Inject(`CACHED_${token}`);
