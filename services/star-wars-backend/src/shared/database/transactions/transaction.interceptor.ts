import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { TransactionContextService } from './transaction-context.service';
import { Reflector } from '@nestjs/core';

export const TRANSACTIONAL_KEY = 'transactional';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    private readonly transactionContext: TransactionContextService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Add null check for reflector
    if (!this.reflector) {
      return next.handle();
    }

    const isTransactional = this.reflector.getAllAndOverride<boolean>(
      TRANSACTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isTransactional) {
      return next.handle();
    }

    // Simplified implementation using from() to convert Promise to Observable
    return from(
      this.transactionContext.executeInTransaction(async () => {
        return new Promise((resolve, reject) => {
          next.handle().subscribe({
            next: (value) => resolve(value),
            error: (error) =>
              reject(error instanceof Error ? error : new Error(String(error))),
            complete: () => {},
          });
        });
      }),
    );
  }
}
