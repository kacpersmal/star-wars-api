import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { RedisService } from './redis.service';

@Module({
  imports: [CommonModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
