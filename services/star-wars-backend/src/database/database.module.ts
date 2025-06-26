import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { DatabaseService } from './database.service';

@Module({
  imports: [CommonModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
