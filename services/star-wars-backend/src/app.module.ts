import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { HealthModule } from './system/health/health.module';
import { FeaturesModule } from './features/features.module';

@Module({
  imports: [SharedModule, HealthModule, FeaturesModule],
})
export class AppModule {}
