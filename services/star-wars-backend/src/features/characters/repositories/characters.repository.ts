import { Injectable } from '@nestjs/common';
import { eq, ilike, and } from 'drizzle-orm';
import { DatabaseService } from '../../../shared/database/database.service';
import { characters } from '../../../shared/database/schema';
import { CreateCharacterDto } from '../dto/create-character.dto';
import { UpdateCharacterDto } from '../dto/update-character.dto';
import { CharacterQueryDto } from '../dto/character-query.dto';

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
export class CharactersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private async getCharacterWithRelations(
    characterId: string,
  ): Promise<CharacterWithRelations | null> {
    const db = this.databaseService.getDb();

    const characterData = await db.query.characters.findFirst({
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

  async create(
    createCharacterDto: CreateCharacterDto,
  ): Promise<CharacterWithRelations> {
    const db = this.databaseService.getDb();

    const [character] = await db
      .insert(characters)
      .values(createCharacterDto)
      .returning();

    const characterWithRelations = await this.getCharacterWithRelations(
      character.id,
    );
    return characterWithRelations!;
  }

  async findAll(query: CharacterQueryDto): Promise<CharacterWithRelations[]> {
    const db = this.databaseService.getDb();
    const conditions: any[] = [];

    if (query.name) {
      conditions.push(ilike(characters.name, `%${query.name}%`));
    }

    if (query.speciesId) {
      conditions.push(eq(characters.speciesId, query.speciesId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const charactersData = await db.query.characters.findMany({
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

  async findOne(id: string): Promise<CharacterWithRelations | null> {
    return this.getCharacterWithRelations(id);
  }

  async update(
    id: string,
    updateCharacterDto: UpdateCharacterDto,
  ): Promise<CharacterWithRelations> {
    const db = this.databaseService.getDb();

    const [updatedCharacter] = await db
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

  async remove(id: string): Promise<void> {
    const db = this.databaseService.getDb();

    await db.delete(characters).where(eq(characters.id, id));
  }
}
