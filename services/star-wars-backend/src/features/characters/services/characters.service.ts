import { Injectable } from '@nestjs/common';
import { CharactersRepository } from '../repositories/characters.repository';
import { CreateCharacterDto } from '../dto/create-character.dto';
import { UpdateCharacterDto } from '../dto/update-character.dto';
import { CharacterQueryDto } from '../dto/character-query.dto';
import { ErrorFactory } from '../../../shared/errors/core/application-error.factory';
import { getErrorMessage } from '../../../shared/utils/error.util';
import { InjectCached } from 'src/shared/utils/inject-cached.decorator';
import { CacheService } from '../../../shared/redis/cache/cache.service';

@Injectable()
export class CharactersService {
  constructor(
    private readonly charactersRepository: CharactersRepository,
    @InjectCached('CHARACTERS_REPOSITORY')
    private readonly cachedCharactersRepository: CharactersRepository,
    private readonly cacheService: CacheService,
  ) {}

  async create(createCharacterDto: CreateCharacterDto) {
    try {
      const character =
        await this.charactersRepository.create(createCharacterDto);

      await this.invalidateFindAllCache();

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
      return await this.cachedCharactersRepository.findAll(query);
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'CHARACTERS',
        'Failed to fetch characters',
        { query, originalError: getErrorMessage(error) },
      );
    }
  }

  async findOne(id: string) {
    const character = await this.cachedCharactersRepository.findOne(id);

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
      const updatedCharacter = await this.charactersRepository.update(
        id,
        updateCharacterDto,
      );

      await this.invalidateCharacterCache(id);

      await this.invalidateFindAllCache();

      return updatedCharacter;
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

      await this.invalidateCharacterCache(id);

      await this.invalidateFindAllCache();
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'CHARACTERS',
        'Failed to delete character',
        { characterId: id, originalError: getErrorMessage(error) },
      );
    }
  }

  private async invalidateCharacterCache(characterId: string): Promise<void> {
    try {
      const findOneKey = this.cacheService.generateCacheKey({
        keyPrefix: 'characters_repository',
        className: 'CharactersRepository',
        methodName: 'findOne',
        args: [characterId],
      });

      await this.cacheService.del(findOneKey);
    } catch (error) {
      console.warn(
        `Failed to invalidate character cache for ID ${characterId}:`,
        getErrorMessage(error),
      );
    }
  }

  private async invalidateFindAllCache(): Promise<void> {
    try {
      await this.cacheService.invalidatePattern(
        `*characters_repository:CharactersRepository:findAll:*`,
      );
    } catch (error) {
      console.warn(
        'Failed to invalidate findAll cache:',
        getErrorMessage(error),
      );
    }
  }
}
