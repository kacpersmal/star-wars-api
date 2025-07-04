import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { SystemModule } from './system';
import { FeaturesModule } from './features/features.module';
import { JobsModule } from './jobs/jobs.module';
import { CorrelationIdMiddleware } from './shared/errors/middleware/correlation-id.middleware';

@Module({
  imports: [SharedModule, SystemModule, FeaturesModule, JobsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
