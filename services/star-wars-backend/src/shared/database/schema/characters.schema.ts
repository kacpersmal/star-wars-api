import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { species } from './species.schema';

export const characters = pgTable('characters', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  speciesId: uuid('species_id')
    .notNull()
    .references(() => species.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
