import { Injectable } from '@nestjs/common';
import { CharactersRepository } from '../repositories/characters.repository';
import { CreateCharacterDto } from '../dto/create-character.dto';
import { UpdateCharacterDto } from '../dto/update-character.dto';
import { CharacterQueryDto } from '../dto/character-query.dto';
import { ErrorFactory } from '../../../shared/errors/core/application-error.factory';
import { getErrorMessage } from '../../../shared/utils/error.util';

@Injectable()
export class CharactersService {
  constructor(private readonly charactersRepository: CharactersRepository) {}

  async create(createCharacterDto: CreateCharacterDto) {
    try {
      return await this.charactersRepository.create(createCharacterDto);
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
      return await this.charactersRepository.findAll(query);
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'CHARACTERS',
        'Failed to fetch characters',
        { query, originalError: getErrorMessage(error) },
      );
    }
  }

  async findOne(id: string) {
    const character = await this.charactersRepository.findOne(id);

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
      await this.charactersRepository.remove(id);
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'CHARACTERS',
        'Failed to delete character',
        { characterId: id, originalError: getErrorMessage(error) },
      );
    }
  }
}
