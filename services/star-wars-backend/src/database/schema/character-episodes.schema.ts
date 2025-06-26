import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { characters } from './characters.schema';
import { episodes } from './episodes.schema';

export const characterEpisodes = pgTable('character_episodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id')
    .notNull()
    .references(() => characters.id, { onDelete: 'cascade' }),
  episodeId: uuid('episode_id')
    .notNull()
    .references(() => episodes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

export type CharacterEpisode = typeof characterEpisodes.$inferSelect;
export type NewCharacterEpisode = typeof characterEpisodes.$inferInsert;
