import { Injectable } from '@nestjs/common';
import { CharactersRepository } from '../repositories/characters.repository';
import { CreateCharacterDto } from '../dto/create-character.dto';
import { UpdateCharacterDto } from '../dto/update-character.dto';
import { CharacterQueryDto } from '../dto/character-query.dto';
import { ErrorFactory } from '../../../shared/errors/core/application-error.factory';
import { getErrorMessage } from '../../../shared/utils/error.util';
import { InjectCached } from '../../../shared/utils/inject-cached.decorator';
import { EventService } from '../../../shared/events/services/event.service';
import { CHARACTER_CREATED_EVENT } from '../../../shared/events';

@Injectable()
export class CharactersService {
  constructor(
    private readonly charactersRepository: CharactersRepository,
    @InjectCached('CHARACTERS_REPOSITORY')
    private readonly cachedCharactersRepository: CharactersRepository,
    private readonly eventService: EventService,
  ) {}

  async create(createCharacterDto: CreateCharacterDto) {
    try {
      const character =
        await this.charactersRepository.create(createCharacterDto);

      await this.eventService.publish(CHARACTER_CREATED_EVENT, {
        id: character.id,
        name: character.name,
      });

      return character;
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'CHARACTERS',
        'Failed to create character',
        {
          originalError: getErrorMessage(error),
        },
      );
    }
  }

  async findAll(query: CharacterQueryDto) {
    try {
      const { limit = 10, offset = 0, name } = query;
      return await this.cachedCharactersRepository.getAll(limit, offset, name);
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'CHARACTERS',
        'Failed to fetch characters',
        { query, originalError: getErrorMessage(error) },
      );
    }
  }

  async findOne(id: string) {
    const character = await this.cachedCharactersRepository.getById(id);

    if (!character) {
      throw ErrorFactory.createNotFoundError(
        'CHARACTERS',
        `Character with ID ${id} not found`,
        { characterId: id },
      );
    }

    return character;
  }

  async update(id: string, updateCharacterDto: UpdateCharacterDto) {
    await this.findOne(id);
    try {
      return await this.charactersRepository.update(id, updateCharacterDto);
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'CHARACTERS',
        'Failed to update character',
        { characterId: id, originalError: getErrorMessage(error) },
      );
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.charactersRepository.delete(id);
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'CHARACTERS',
        'Failed to delete character',
        { characterId: id, originalError: getErrorMessage(error) },
      );
    }
  }
}
