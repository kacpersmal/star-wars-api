import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../config/configuration.module';
import { RedisService } from './redis.service';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheProxyFactory } from './cache/cache-proxy.factory';
import { CacheService } from './cache/cache.service';

@Module({
  imports: [ConfigurationModule, CacheModule.register()],
  providers: [RedisService, CacheService, CacheProxyFactory],
  exports: [RedisService, CacheService, CacheProxyFactory],
})
export class RedisModule {}
