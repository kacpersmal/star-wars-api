import { Module } from '@nestjs/common';
import { RedisModule } from '../../shared/redis/redis.module';
import { CacheManagerService } from './cache-manager.service';
import { CacheController } from './cache.controller';

@Module({
  imports: [RedisModule],
  providers: [CacheManagerService],
  controllers: [CacheController],
  exports: [CacheManagerService],
})
export class CacheManagementModule {}
