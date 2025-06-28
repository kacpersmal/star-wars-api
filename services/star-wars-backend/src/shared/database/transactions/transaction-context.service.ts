import { Injectable, Scope, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { DatabaseService } from '../database.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';
import { randomUUID } from 'crypto';

export const TRANSACTION_KEY = 'DATABASE_TRANSACTION';
export const TRANSACTION_ID_KEY = 'TRANSACTION_ID';

type DatabaseTransaction = NodePgDatabase<typeof schema>;

@Injectable({ scope: Scope.REQUEST })
export class TransactionContextService {
  private readonly logger = new Logger(TransactionContextService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cls: ClsService,
  ) {}

  private generateTransactionId(): string {
    return `tx_${randomUUID().substring(0, 8)}`;
  }

  private getTransactionId(): string | undefined {
    return this.cls.get(TRANSACTION_ID_KEY);
  }

  private setTransactionId(id: string): void {
    this.cls.set(TRANSACTION_ID_KEY, id);
  }

  async startTransaction<T>(
    callback: (tx: DatabaseTransaction) => Promise<T>,
  ): Promise<T> {
    const transactionId = this.generateTransactionId();
    this.setTransactionId(transactionId);

    this.logger.log(`Starting transaction [${transactionId}]`);
    const startTime = Date.now();

    try {
      const result = await this.databaseService.transaction(callback);
      const duration = Date.now() - startTime;

      this.logger.log(
        `Transaction committed successfully [${transactionId}] - Duration: ${duration}ms`,
      );
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Transaction rolled back [${transactionId}] - Duration: ${duration}ms - Error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  setTransaction(tx: DatabaseTransaction): void {
    const transactionId = this.getTransactionId();
    this.logger.debug(
      `Setting transaction context [${transactionId || 'unknown'}]`,
    );
    this.cls.set(TRANSACTION_KEY, tx);
  }

  getTransaction(): DatabaseTransaction | undefined {
    const transaction = this.cls.get<DatabaseTransaction>(TRANSACTION_KEY);
    const transactionId = this.getTransactionId();

    if (transaction) {
      this.logger.debug(
        `Retrieved existing transaction [${transactionId || 'unknown'}]`,
      );
    }

    return transaction;
  }

  hasTransaction(): boolean {
    const hasTransaction = this.cls.has(TRANSACTION_KEY);
    const transactionId = this.getTransactionId();

    this.logger.debug(
      `Transaction check [${transactionId || 'unknown'}]: ${hasTransaction ? 'exists' : 'not found'}`,
    );
    return hasTransaction;
  }

  async executeInTransaction<T>(
    operation: (tx: DatabaseTransaction) => Promise<T>,
  ): Promise<T> {
    const existingTx = this.getTransaction();
    const transactionId = this.getTransactionId();

    if (existingTx) {
      this.logger.debug(
        `Using existing transaction [${transactionId || 'unknown'}]`,
      );
      return operation(existingTx);
    }

    this.logger.debug(`Creating new transaction for operation`);

    return this.startTransaction(async (tx) => {
      const currentTransactionId = this.getTransactionId();
      this.logger.debug(
        `Executing operation in transaction [${currentTransactionId}]`,
      );

      this.setTransaction(tx);
      try {
        const result = await operation(tx);
        this.logger.debug(
          `Operation completed successfully [${currentTransactionId}]`,
        );
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Operation failed in transaction [${currentTransactionId}]: ${errorMessage}`,
          error instanceof Error ? error.stack : undefined,
        );
        throw error;
      } finally {
        this.logger.debug(
          `Cleaning up transaction context [${currentTransactionId}]`,
        );
        this.cls.set(TRANSACTION_KEY, undefined);
        this.cls.set(TRANSACTION_ID_KEY, undefined);
      }
    });
  }
}
