import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const species = pgTable('species', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Species = typeof species.$inferSelect;
export type NewSpecies = typeof species.$inferInsert;
