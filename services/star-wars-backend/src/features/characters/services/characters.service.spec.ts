/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { CharactersService } from './characters.service';
import { CharactersRepository } from '../repositories/characters.repository';
import { CreateCharacterDto } from '../dto/create-character.dto';
import { UpdateCharacterDto } from '../dto/update-character.dto';
import { CharacterQueryDto } from '../dto/character-query.dto';
import { ApplicationError } from '../../../shared/errors/core/application-error';
import { ErrorFactory } from '../../../shared/errors/core/application-error.factory';
import { CharacterWithRelations } from '../repositories/characters.repository';
import { EventService } from '../../../shared/events/services/event.service';

describe('CharactersService', () => {
  let service: CharactersService;
  let charactersRepository: jest.Mocked<CharactersRepository>;
  let cachedCharactersRepository: jest.Mocked<CharactersRepository>;
  let eventService: jest.Mocked<EventService>;

  const mockCharacter: CharacterWithRelations = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Luke Skywalker',
    speciesId: '123e4567-e89b-12d3-a456-426614174001',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    species: {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Human',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    },
    episodes: [
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        title: 'A New Hope',
        releaseDate: '1977-05-25',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    ],
  };

  const mockCharactersRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCachedCharactersRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockEventService = {
    publish: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharactersService,
        {
          provide: CharactersRepository,
          useValue: mockCharactersRepository,
        },
        {
          provide: 'CACHED_CHARACTERS_REPOSITORY',
          useValue: mockCachedCharactersRepository,
        },
        {
          provide: EventService,
          useValue: mockEventService,
        },
      ],
    }).compile();

    service = module.get<CharactersService>(CharactersService);
    charactersRepository = module.get(CharactersRepository);
    cachedCharactersRepository = module.get('CACHED_CHARACTERS_REPOSITORY');
    eventService = module.get(EventService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCharacterDto: CreateCharacterDto = {
      name: 'Luke Skywalker',
      speciesId: '123e4567-e89b-12d3-a456-426614174001',
    };

    it('should create a character successfully', async () => {
      charactersRepository.create.mockResolvedValue(mockCharacter);

      const result = await service.create(createCharacterDto);

      expect(charactersRepository.create).toHaveBeenCalledWith(
        createCharacterDto,
      );
      expect(result).toEqual(mockCharacter);
    });

    it('should throw InternalError when repository throws an error', async () => {
      const repositoryError = new Error('Database connection failed');
      charactersRepository.create.mockRejectedValue(repositoryError);

      await expect(service.create(createCharacterDto)).rejects.toThrow(
        ApplicationError,
      );

      try {
        await service.create(createCharacterDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        expect(error.domain).toBe('CHARACTERS');
        expect(error.code).toBe('INTERNAL_ERROR');
        expect(error.message).toBe('Failed to create character');
        expect(error.context?.originalError).toBe('Database connection failed');
      }
    });

    it('should throw InternalError when repository throws a string error', async () => {
      charactersRepository.create.mockRejectedValue('Connection timeout');

      await expect(service.create(createCharacterDto)).rejects.toThrow(
        ApplicationError,
      );

      try {
        await service.create(createCharacterDto);
      } catch (error) {
        expect(error.context?.originalError).toBe('Connection timeout');
      }
    });
  });

  describe('findAll', () => {
    const queryDto: CharacterQueryDto = {
      name: 'Luke',
      limit: 10,
      offset: 0,
    };

    it('should return characters successfully', async () => {
      const mockCharacters = [mockCharacter];
      cachedCharactersRepository.findAll.mockResolvedValue(mockCharacters);

      const result = await service.findAll(queryDto);

      expect(cachedCharactersRepository.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockCharacters);
    });

    it('should return empty array when no characters found', async () => {
      cachedCharactersRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll(queryDto);

      expect(result).toEqual([]);
    });

    it('should throw InternalError when cached repository throws an error', async () => {
      const repositoryError = new Error('Cache connection failed');
      cachedCharactersRepository.findAll.mockRejectedValue(repositoryError);

      await expect(service.findAll(queryDto)).rejects.toThrow(ApplicationError);

      try {
        await service.findAll(queryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        expect(error.domain).toBe('CHARACTERS');
        expect(error.code).toBe('INTERNAL_ERROR');
        expect(error.message).toBe('Failed to fetch characters');
        expect(error.context?.query).toEqual(queryDto);
        expect(error.context?.originalError).toBe('Cache connection failed');
      }
    });
  });

  describe('findOne', () => {
    const characterId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return character when found', async () => {
      cachedCharactersRepository.findOne.mockResolvedValue(mockCharacter);

      const result = await service.findOne(characterId);

      expect(cachedCharactersRepository.findOne).toHaveBeenCalledWith(
        characterId,
      );
      expect(result).toEqual(mockCharacter);
    });

    it('should throw NotFoundError when character does not exist', async () => {
      cachedCharactersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(characterId)).rejects.toThrow(
        ApplicationError,
      );

      try {
        await service.findOne(characterId);
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        expect(error.domain).toBe('CHARACTERS');
        expect(error.code).toBe('NOT_FOUND');
        expect(error.message).toBe(
          `Character with ID ${characterId} not found`,
        );
        expect(error.context?.characterId).toBe(characterId);
        expect(error.statusCode).toBe(404);
      }
    });

    it('should throw InternalError when cached repository throws an error', async () => {
      const repositoryError = new Error('Database query failed');
      cachedCharactersRepository.findOne.mockRejectedValue(repositoryError);

      await expect(service.findOne(characterId)).rejects.toThrow();
    });
  });

  describe('update', () => {
    const characterId = '123e4567-e89b-12d3-a456-426614174000';
    const updateCharacterDto: UpdateCharacterDto = {
      name: 'Luke Skywalker Updated',
    };

    it('should update character successfully', async () => {
      const updatedCharacter = {
        ...mockCharacter,
        name: 'Luke Skywalker Updated',
      };

      cachedCharactersRepository.findOne.mockResolvedValue(mockCharacter);
      charactersRepository.update.mockResolvedValue(updatedCharacter);

      const result = await service.update(characterId, updateCharacterDto);

      expect(cachedCharactersRepository.findOne).toHaveBeenCalledWith(
        characterId,
      );
      expect(charactersRepository.update).toHaveBeenCalledWith(
        characterId,
        updateCharacterDto,
      );
      expect(result).toEqual(updatedCharacter);
    });

    it('should throw NotFoundError when character does not exist', async () => {
      cachedCharactersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(characterId, updateCharacterDto),
      ).rejects.toThrow(ApplicationError);

      try {
        await service.update(characterId, updateCharacterDto);
      } catch (error) {
        expect(error.domain).toBe('CHARACTERS');
        expect(error.code).toBe('NOT_FOUND');
      }

      expect(charactersRepository.update).not.toHaveBeenCalled();
    });

    it('should throw InternalError when update fails', async () => {
      cachedCharactersRepository.findOne.mockResolvedValue(mockCharacter);
      const repositoryError = new Error('Update constraint violation');
      charactersRepository.update.mockRejectedValue(repositoryError);

      await expect(
        service.update(characterId, updateCharacterDto),
      ).rejects.toThrow(ApplicationError);

      try {
        await service.update(characterId, updateCharacterDto);
      } catch (error) {
        expect(error.domain).toBe('CHARACTERS');
        expect(error.code).toBe('INTERNAL_ERROR');
        expect(error.message).toBe('Failed to update character');
        expect(error.context?.characterId).toBe(characterId);
        expect(error.context?.originalError).toBe(
          'Update constraint violation',
        );
      }
    });
  });

  describe('remove', () => {
    const characterId = '123e4567-e89b-12d3-a456-426614174000';

    it('should remove character successfully', async () => {
      cachedCharactersRepository.findOne.mockResolvedValue(mockCharacter);
      charactersRepository.remove.mockResolvedValue(undefined);

      await service.remove(characterId);

      expect(cachedCharactersRepository.findOne).toHaveBeenCalledWith(
        characterId,
      );
      expect(charactersRepository.remove).toHaveBeenCalledWith(characterId);
    });

    it('should throw NotFoundError when character does not exist', async () => {
      cachedCharactersRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(characterId)).rejects.toThrow(
        ApplicationError,
      );

      try {
        await service.remove(characterId);
      } catch (error) {
        expect(error.domain).toBe('CHARACTERS');
        expect(error.code).toBe('NOT_FOUND');
      }

      expect(charactersRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw InternalError when remove fails', async () => {
      cachedCharactersRepository.findOne.mockResolvedValue(mockCharacter);
      const repositoryError = new Error('Foreign key constraint violation');
      charactersRepository.remove.mockRejectedValue(repositoryError);

      await expect(service.remove(characterId)).rejects.toThrow(
        ApplicationError,
      );

      try {
        await service.remove(characterId);
      } catch (error) {
        expect(error.domain).toBe('CHARACTERS');
        expect(error.code).toBe('INTERNAL_ERROR');
        expect(error.message).toBe('Failed to delete character');
        expect(error.context?.characterId).toBe(characterId);
        expect(error.context?.originalError).toBe(
          'Foreign key constraint violation',
        );
      }
    });
  });
});
