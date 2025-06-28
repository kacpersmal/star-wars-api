import { Injectable } from '@nestjs/common';
import { eq, ilike, and, type SQL } from 'drizzle-orm';
import { DatabaseService } from '../../../shared/database/database.service';
import { CacheService } from '../../../shared/redis/cache/cache.service';
import { AbstractRepository } from '../../../shared/repositories/abstract.repository';
import { characters } from '../../../shared/database/schema';
import { CreateCharacterDto } from '../dto/create-character.dto';
import { UpdateCharacterDto } from '../dto/update-character.dto';
import { CharacterQueryDto } from '../dto/character-query.dto';
import {
  TypedCache,
  InvalidatePattern,
  InvalidateMethod,
} from '../../../shared/redis/cache/typed-cache.decorator';
import { CachePatterns } from '../../../shared/redis/cache/cache-pattern-builder';

export interface CharacterWithRelations {
  id: string;
  name: string;
  speciesId: string;
  createdAt: Date;
  updatedAt: Date;
  species: {
    id: string;
    name: string;
    createdAt: Date | null;
    updatedAt: Date | null;
  } | null;
  episodes: Array<{
    id: string;
    title: string;
    releaseDate: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

@Injectable()
export class CharactersRepository extends AbstractRepository {
  constructor(databaseService: DatabaseService, cacheService: CacheService) {
    super(databaseService, cacheService);
  }

  private async getCharacterWithRelations(
    characterId: string,
  ): Promise<CharacterWithRelations | null> {
    const characterData = await this.db.query.characters.findFirst({
      where: eq(characters.id, characterId),
      with: {
        species: true,
        characterEpisodes: {
          with: {
            episode: true,
          },
        },
      },
    });

    if (!characterData) {
      return null;
    }
    return {
      id: characterData.id,
      name: characterData.name,
      speciesId: characterData.speciesId,
      createdAt: characterData.createdAt!,
      updatedAt: characterData.updatedAt!,
      species: characterData.species,
      episodes: characterData.characterEpisodes.map((ce) => ({
        id: ce.episode.id,
        title: ce.episode.name,
        releaseDate: ce.episode.date || '',
        createdAt: ce.episode.createdAt!,
        updatedAt: ce.episode.updatedAt!,
      })),
    };
  }

  @InvalidatePattern(CachePatterns.Characters.findAll)
  async create(
    createCharacterDto: CreateCharacterDto,
  ): Promise<CharacterWithRelations> {
    const [character] = await this.db
      .insert(characters)
      .values(createCharacterDto)
      .returning();

    const characterWithRelations = await this.getCharacterWithRelations(
      character.id,
    );

    return characterWithRelations!;
  }

  @TypedCache({ ttl: 60 })
  async findAll(query: CharacterQueryDto): Promise<CharacterWithRelations[]> {
    const conditions: SQL<unknown>[] = [];
    if (query.name) {
      conditions.push(ilike(characters.name, `%${query.name}%`));
    }

    if (query.speciesId) {
      conditions.push(eq(characters.speciesId, query.speciesId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const charactersData = await this.db.query.characters.findMany({
      where: whereClause,
      limit: query.limit || 10,
      offset: query.offset || 0,
      with: {
        species: true,
        characterEpisodes: {
          with: {
            episode: true,
          },
        },
      },
    });

    return charactersData.map((character) => ({
      id: character.id,
      name: character.name,
      speciesId: character.speciesId,
      createdAt: character.createdAt!,
      updatedAt: character.updatedAt!,
      species: character.species,
      episodes: character.characterEpisodes.map((ce) => ({
        id: ce.episode.id,
        title: ce.episode.name,
        releaseDate: ce.episode.date || '',
        createdAt: ce.episode.createdAt!,
        updatedAt: ce.episode.updatedAt!,
      })),
    }));
  }

  @TypedCache({ ttl: 60 })
  async findOne(id: string): Promise<CharacterWithRelations | null> {
    return this.getCharacterWithRelations(id);
  }

  @InvalidateMethod(
    'CharactersRepository',
    ['findOne'],
    'characters_repository',
  )
  @InvalidatePattern(CachePatterns.Characters.findAll)
  async update(
    id: string,
    updateCharacterDto: UpdateCharacterDto,
  ): Promise<CharacterWithRelations> {
    const [updatedCharacter] = await this.db
      .update(characters)
      .set({
        ...updateCharacterDto,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, id))
      .returning();

    const characterWithRelations = await this.getCharacterWithRelations(
      updatedCharacter.id,
    );

    return characterWithRelations!;
  }

  @InvalidateMethod(
    'CharactersRepository',
    ['findOne'],
    'characters_repository',
  )
  @InvalidatePattern(CachePatterns.Characters.findAll)
  async remove(id: string): Promise<void> {
    await this.db.delete(characters).where(eq(characters.id, id));
  }
}
