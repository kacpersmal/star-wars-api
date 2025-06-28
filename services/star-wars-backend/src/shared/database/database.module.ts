import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from './database.service';
import { TransactionContextService } from './transactions/transaction-context.service';
import { TransactionInterceptor } from './transactions/transaction.interceptor';

@Global()
@Module({
  providers: [
    DatabaseService,
    TransactionContextService,
    Reflector,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransactionInterceptor,
    },
  ],
  exports: [DatabaseService, TransactionContextService, Reflector],
})
export class DatabaseModule {}
