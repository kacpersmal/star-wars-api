import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigurationModule } from './config/configuration.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { ErrorModule } from './errors/error.module';
import { EventsModule } from './events/events.module';
import { ConfigurationService } from './config/configuration.service';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import { DRIZZLE } from './database/drizzle.provider';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
      },
      plugins: [
        new ClsPluginTransactional({
          imports: [DatabaseModule],
          adapter: new TransactionalAdapterDrizzleOrm({
            drizzleInstanceToken: DRIZZLE,
          }),
        }),
      ],
    }),
    ConfigurationModule,
    DatabaseModule,
    RedisModule,
    ErrorModule,
    BullModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (configService: ConfigurationService) => {
        const redisConfig = configService.redis;
        return {
          redis: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
          },
        };
      },
      inject: [ConfigurationService],
    }),
    EventsModule,
  ],
  exports: [
    ConfigurationModule,
    DatabaseModule,
    RedisModule,
    ErrorModule,
    EventsModule,
  ],
})
export class SharedModule {}
