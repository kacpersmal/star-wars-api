import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { CacheManagementModule } from './cache/cache-management.module';

@Module({
  imports: [HealthModule, CacheManagementModule],
  exports: [HealthModule, CacheManagementModule],
})
export class SystemModule {}
