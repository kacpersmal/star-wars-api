import { relations } from 'drizzle-orm';
import { characters } from './characters.schema';
import { episodes } from './episodes.schema';
import { species } from './species.schema';
import { characterEpisodes } from './character-episodes.schema';

export const speciesRelations = relations(species, ({ many }) => ({
  characters: many(characters),
}));

export const charactersRelations = relations(characters, ({ one, many }) => ({
  species: one(species, {
    fields: [characters.speciesId],
    references: [species.id],
  }),
  characterEpisodes: many(characterEpisodes),
}));

export const episodesRelations = relations(episodes, ({ many }) => ({
  characterEpisodes: many(characterEpisodes),
}));

export const characterEpisodesRelations = relations(
  characterEpisodes,
  ({ one }) => ({
    character: one(characters, {
      fields: [characterEpisodes.characterId],
      references: [characters.id],
    }),
    episode: one(episodes, {
      fields: [characterEpisodes.episodeId],
      references: [episodes.id],
    }),
  }),
);
