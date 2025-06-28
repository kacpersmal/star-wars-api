import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigurationService } from '../config/configuration.service';
import * as DbSchema from './schema';
import { DrizzleLogger } from './drizzle.logger';
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';

export const DRIZZLE = 'DRIZZLE';

// Create a factory function to get the drizzle client for typing
const createDrizzleClient = (pool: Pool) => {
  return drizzle(pool, {
    schema: DbSchema,
    logger: new DrizzleLogger(),
  });
};

// Export the type of the drizzle client
export type DrizzleClient = ReturnType<typeof createDrizzleClient>;
export type MyDrizzleAdapter = TransactionalAdapterDrizzleOrm<DrizzleClient>;

export const DrizzleProvider = {
  provide: DRIZZLE,
  useFactory: async (
    configService: ConfigurationService,
  ): Promise<DrizzleClient> => {
    const dbConfig = configService.database;

    const pool = new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    const db = createDrizzleClient(pool);

    // Check if transactions are supported
    if (!db.transaction) {
      throw new Error(
        'Drizzle database instance does not support transactions. Check your drizzle-orm version and setup.',
      );
    }

    // Test the connection
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
    } catch (error) {
      throw new Error(
        `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return db;
  },
  inject: [ConfigurationService],
};
