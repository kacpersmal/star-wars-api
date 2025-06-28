import { SetMetadata } from '@nestjs/common';
import { TRANSACTIONAL_KEY } from './transaction.interceptor';

export const Transactional = (enabled = true) =>
  SetMetadata(TRANSACTIONAL_KEY, enabled);
