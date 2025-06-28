import { Injectable, Scope } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { DatabaseService } from '../database.service';

export const TRANSACTION_KEY = 'DATABASE_TRANSACTION';

@Injectable({ scope: Scope.REQUEST })
export class TransactionContextService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cls: ClsService,
  ) {}

  async startTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return await this.databaseService.transaction(callback);
  }

  setTransaction(tx: any): void {
    this.cls.set(TRANSACTION_KEY, tx);
  }

  getTransaction(): any {
    return this.cls.get(TRANSACTION_KEY);
  }

  hasTransaction(): boolean {
    return this.cls.has(TRANSACTION_KEY);
  }

  async executeInTransaction<T>(
    operation: (tx: any) => Promise<T>,
  ): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const existingTx = this.getTransaction();
    if (existingTx) {
      // Use existing transaction
      return operation(existingTx);
    }

    // Start new transaction
    return this.startTransaction(async (tx) => {
      this.setTransaction(tx);
      try {
        return await operation(tx);
      } finally {
        this.cls.set(TRANSACTION_KEY, undefined);
      }
    });
  }
}
