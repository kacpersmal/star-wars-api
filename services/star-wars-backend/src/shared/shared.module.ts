import { Module } from '@nestjs/common';
import { ConfigurationModule } from './config/configuration.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { ErrorModule } from './errors/error.module';

@Module({
  imports: [ConfigurationModule, DatabaseModule, RedisModule, ErrorModule],
  exports: [ConfigurationModule, DatabaseModule, RedisModule, ErrorModule],
})
export class SharedModule {}
