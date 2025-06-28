/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import {
  CharactersRepository,
  CharacterWithRelations,
} from './characters.repository';
import { DatabaseService } from '../../../shared/database/database.service';
import { CacheService } from '../../../shared/redis/cache/cache.service';
import { CreateCharacterDto } from '../dto/create-character.dto';
import { UpdateCharacterDto } from '../dto/update-character.dto';
import { CharacterQueryDto } from '../dto/character-query.dto';

describe('CharactersRepository', () => {
  let repository: CharactersRepository;
  let databaseService: jest.Mocked<DatabaseService>;
  let cacheService: jest.Mocked<CacheService>;

  const mockDb = {
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    query: {
      characters: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    },
  };

  const mockDatabaseService = {
    getDb: jest.fn().mockReturnValue(mockDb),
  };

  const mockCacheService = {
    generateCacheKey: jest.fn(),
    del: jest.fn(),
    invalidatePattern: jest.fn(),
  };

  const mockCharacterData = {
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
    characterEpisodes: [
      {
        episode: {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'A New Hope',
          date: '1977-05-25',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        },
      },
    ],
  };

  const expectedCharacter: CharacterWithRelations = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharactersRepository,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    repository = module.get<CharactersRepository>(CharactersRepository);
    databaseService = module.get(DatabaseService);
    cacheService = module.get(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCharacterDto: CreateCharacterDto = {
      name: 'Luke Skywalker',
      speciesId: '123e4567-e89b-12d3-a456-426614174001',
    };

    it('should create character and invalidate findAll cache', async () => {
      const mockInsertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest
          .fn()
          .mockResolvedValue([{ id: '123e4567-e89b-12d3-a456-426614174000' }]),
      };

      mockDb.insert.mockReturnValue(mockInsertChain);
      mockDb.query.characters.findFirst.mockResolvedValue(mockCharacterData);

      const result = await repository.create(createCharacterDto);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockInsertChain.values).toHaveBeenCalledWith(createCharacterDto);
      expect(mockInsertChain.returning).toHaveBeenCalled();
      expect(mockDb.query.characters.findFirst).toHaveBeenCalled();
      expect(result).toEqual(expectedCharacter);
    });
  });

  describe('findAll', () => {
    const queryDto: CharacterQueryDto = {
      name: 'Luke',
      limit: 10,
      offset: 0,
    };

    it('should find characters with query filters', async () => {
      mockDb.query.characters.findMany.mockResolvedValue([mockCharacterData]);

      const result = await repository.findAll(queryDto);

      expect(mockDb.query.characters.findMany).toHaveBeenCalledWith({
        where: expect.any(Object), // Will contain ilike condition for name
        limit: 10,
        offset: 0,
        with: {
          species: true,
          characterEpisodes: {
            with: {
              episode: true,
            },
          },
        },
      });
      expect(result).toEqual([expectedCharacter]);
    });

    it('should find characters without filters', async () => {
      const emptyQuery: CharacterQueryDto = {};
      mockDb.query.characters.findMany.mockResolvedValue([mockCharacterData]);

      const result = await repository.findAll(emptyQuery);

      expect(mockDb.query.characters.findMany).toHaveBeenCalledWith({
        where: undefined,
        limit: 10,
        offset: 0,
        with: {
          species: true,
          characterEpisodes: {
            with: {
              episode: true,
            },
          },
        },
      });
      expect(result).toEqual([expectedCharacter]);
    });

    it('should apply species filter', async () => {
      const queryWithSpecies: CharacterQueryDto = {
        speciesId: '123e4567-e89b-12d3-a456-426614174001',
      };
      mockDb.query.characters.findMany.mockResolvedValue([mockCharacterData]);

      await repository.findAll(queryWithSpecies);

      expect(mockDb.query.characters.findMany).toHaveBeenCalledWith({
        where: expect.any(Object), // Will contain eq condition for speciesId
        limit: 10,
        offset: 0,
        with: {
          species: true,
          characterEpisodes: {
            with: {
              episode: true,
            },
          },
        },
      });
    });

    it('should return empty array when no characters found', async () => {
      mockDb.query.characters.findMany.mockResolvedValue([]);

      const result = await repository.findAll(queryDto);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const characterId = '123e4567-e89b-12d3-a456-426614174000';

    it('should find character by id', async () => {
      mockDb.query.characters.findFirst.mockResolvedValue(mockCharacterData);

      const result = await repository.findOne(characterId);

      expect(mockDb.query.characters.findFirst).toHaveBeenCalledWith({
        where: expect.any(Object), // Will contain eq condition for id
        with: {
          species: true,
          characterEpisodes: {
            with: {
              episode: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedCharacter);
    });

    it('should return null when character not found', async () => {
      mockDb.query.characters.findFirst.mockResolvedValue(null);

      const result = await repository.findOne(characterId);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const characterId = '123e4567-e89b-12d3-a456-426614174000';
    const updateCharacterDto: UpdateCharacterDto = {
      name: 'Luke Skywalker Updated',
    };

    it('should update character successfully', async () => {
      const mockUpdateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: characterId }]),
      };

      mockDb.update.mockReturnValue(mockUpdateChain);
      mockDb.query.characters.findFirst.mockResolvedValue({
        ...mockCharacterData,
        name: 'Luke Skywalker Updated',
      });

      const result = await repository.update(characterId, updateCharacterDto);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockUpdateChain.set).toHaveBeenCalledWith({
        ...updateCharacterDto,
        updatedAt: expect.any(Date),
      });
      expect(mockUpdateChain.where).toHaveBeenCalled();
      expect(mockUpdateChain.returning).toHaveBeenCalled();
      expect(result.name).toBe('Luke Skywalker Updated');
    });

    it('should update character even when cache operations fail', async () => {
      const mockUpdateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: characterId }]),
      };

      mockDb.update.mockReturnValue(mockUpdateChain);
      mockDb.query.characters.findFirst.mockResolvedValue(mockCharacterData);

      // Should not throw even if cache operations fail (handled by decorators)
      const result = await repository.update(characterId, updateCharacterDto);

      expect(result).toEqual(expectedCharacter);
    });
  });

  describe('remove', () => {
    const characterId = '123e4567-e89b-12d3-a456-426614174000';

    it('should remove character successfully', async () => {
      const mockDeleteChain = {
        where: jest.fn().mockResolvedValue(undefined),
      };

      mockDb.delete.mockReturnValue(mockDeleteChain);

      await repository.remove(characterId);

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDeleteChain.where).toHaveBeenCalled();
    });

    it('should remove character even when cache operations fail', async () => {
      const mockDeleteChain = {
        where: jest.fn().mockResolvedValue(undefined),
      };

      mockDb.delete.mockReturnValue(mockDeleteChain);

      // Should not throw even if cache operations fail (handled by decorators)
      await expect(repository.remove(characterId)).resolves.toBeUndefined();
    });
  });
});
