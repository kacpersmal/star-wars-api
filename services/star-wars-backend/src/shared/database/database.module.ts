import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DrizzleProvider, DRIZZLE } from './drizzle.provider';

@Global()
@Module({
  providers: [DrizzleProvider, DatabaseService],
  exports: [DatabaseService, DRIZZLE],
})
export class DatabaseModule {}
