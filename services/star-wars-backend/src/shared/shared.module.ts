import { Module } from '@nestjs/common';
import { ConfigurationModule } from './config/configuration.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [ConfigurationModule, DatabaseModule, RedisModule],
  exports: [ConfigurationModule, DatabaseModule, RedisModule],
})
export class SharedModule {}
