import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../config/configuration.module';
import { RedisService } from './redis.service';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache/cache.service';

@Module({
  imports: [ConfigurationModule, CacheModule.register()],
  providers: [RedisService, CacheService],
  exports: [RedisService, CacheService],
})
export class RedisModule {}
