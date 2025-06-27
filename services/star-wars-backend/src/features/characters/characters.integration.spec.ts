/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { CharactersService } from './services/characters.service';
import { CharactersRepository } from './repositories/characters.repository';
import { DatabaseService } from './../../shared/database/database.service';
import { CacheService } from './../../shared/redis/cache/cache.service';
import { ConfigurationService } from './../../shared/config/configuration.service';
import { RedisService } from './../../shared/redis/redis.service';
import { CacheProxyFactory } from './../../shared/redis/cache/cache-proxy.factory';
import { Reflector } from '@nestjs/core';
import { createCachedProvider } from './../../shared/utils/cache.util';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CharacterQueryDto } from './dto/character-query.dto';
import { EventService } from './../../shared/events/services/event.service';

describe('Characters Integration Tests', () => {
  let service: CharactersService;
  let repository: CharactersRepository;
  let cacheService: CacheService;
  let databaseService: DatabaseService;

  // Mock implementations for dependencies
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

  const mockRedisClient = {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    flushDb: jest.fn(),
    exists: jest.fn(),
  };

  const mockDatabaseService = {
    getDb: jest.fn().mockReturnValue(mockDb),
    checkConnection: jest.fn().mockResolvedValue(true),
  };

  const mockRedisService = {
    getClient: jest.fn().mockReturnValue(mockRedisClient),
    isConnected: jest.fn().mockResolvedValue(true),
  };

  const mockEventService = {
    publish: jest.fn().mockResolvedValue(undefined),
  };

  const mockConfigurationService = {
    database: {
      host: 'localhost',
      port: 5432,
      username: 'test_user',
      password: 'test_password',
      database: 'test_db',
    },
    redis: {
      host: 'localhost',
      port: 6379,
    },
  };

  // Raw database response format
  const mockCharacterDatabaseData = {
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

  // Transformed repository response format (what the repository returns)
  const mockCharacterTransformedData = {
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
        CharactersService,
        CharactersRepository,
        CacheService,
        CacheProxyFactory,
        Reflector,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: ConfigurationService,
          useValue: mockConfigurationService,
        },
        {
          provide: EventService,
          useValue: mockEventService,
        },
        createCachedProvider('CHARACTERS_REPOSITORY', CharactersRepository),
      ],
    }).compile();

    service = module.get<CharactersService>(CharactersService);
    repository = module.get<CharactersRepository>(CharactersRepository);
    cacheService = module.get<CacheService>(CacheService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create character workflow', () => {
    it('should create character and invalidate cache', async () => {
      const createDto: CreateCharacterDto = {
        name: 'Luke Skywalker',
        speciesId: '123e4567-e89b-12d3-a456-426614174001',
      };

      // Mock database insert chain
      const mockInsertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest
          .fn()
          .mockResolvedValue([{ id: '123e4567-e89b-12d3-a456-426614174000' }]),
      };
      mockDb.insert.mockReturnValue(mockInsertChain);
      mockDb.query.characters.findFirst.mockResolvedValue(
        mockCharacterDatabaseData,
      );

      // Mock cache invalidation
      mockRedisClient.keys.mockResolvedValue(['findAll_key1', 'findAll_key2']);
      mockRedisClient.del.mockResolvedValue(2);

      const result = await service.create(createDto);

      // Verify database operations
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockInsertChain.values).toHaveBeenCalledWith(createDto);
      expect(mockInsertChain.returning).toHaveBeenCalled();

      // Verify cache invalidation
      expect(mockRedisClient.keys).toHaveBeenCalledWith(
        '*characters_repository:CharactersRepository:findAll:*',
      );
      expect(mockRedisClient.del).toHaveBeenCalledWith([
        'findAll_key1',
        'findAll_key2',
      ]);

      // Verify result structure matches transformed format
      expect(result).toMatchObject({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Luke Skywalker',
        speciesId: '123e4567-e89b-12d3-a456-426614174001',
        species: {
          name: 'Human',
        },
        episodes: [
          {
            title: 'A New Hope',
            releaseDate: '1977-05-25',
          },
        ],
      });
    });
  });

  describe('find operations with caching', () => {
    it('should cache findAll results', async () => {
      const query: CharacterQueryDto = { limit: 10, offset: 0 };

      // Mock database query to return raw database format
      mockDb.query.characters.findMany.mockResolvedValue([
        mockCharacterDatabaseData,
      ]);

      // Mock cache operations - cache miss on both calls to test actual caching behavior
      let callCount = 0;
      mockRedisClient.get.mockImplementation(() => {
        callCount++;
        return callCount === 1
          ? null
          : JSON.stringify([mockCharacterTransformedData]);
      });
      mockRedisClient.setEx.mockResolvedValue('OK');

      // First call - should hit database and cache result
      const result1 = await service.findAll(query);

      expect(mockDb.query.characters.findMany).toHaveBeenCalledTimes(1);
      expect(mockRedisClient.setEx).toHaveBeenCalled();
      expect(result1).toHaveLength(1);
      expect(result1[0]).toMatchObject({
        name: 'Luke Skywalker',
        episodes: expect.any(Array),
      });

      // Reset the mock to simulate cache hit
      jest.clearAllMocks();
      mockRedisClient.get.mockResolvedValue(
        JSON.stringify([mockCharacterTransformedData]),
      );

      // Second call - should hit cache
      const result2 = await service.findAll(query);

      expect(mockDb.query.characters.findMany).not.toHaveBeenCalled(); // No DB call
      expect(result2).toHaveLength(1);

      // Compare the actual structure that should be the same
      expect(result1[0].id).toBe(result2[0].id);
      expect(result1[0].name).toBe(result2[0].name);
      expect(result1[0].episodes.length).toBe(result2[0].episodes.length);
    });

    it('should cache findOne results', async () => {
      const characterId = '123e4567-e89b-12d3-a456-426614174000';

      // Mock database query to return raw database format
      mockDb.query.characters.findFirst.mockResolvedValue(
        mockCharacterDatabaseData,
      );

      // Mock cache operations - first miss, then hit
      let callCount = 0;
      mockRedisClient.get.mockImplementation(() => {
        callCount++;
        return callCount === 1
          ? null
          : JSON.stringify(mockCharacterTransformedData);
      });
      mockRedisClient.setEx.mockResolvedValue('OK');

      // First call - should hit database and cache result
      const result1 = await service.findOne(characterId);

      expect(mockDb.query.characters.findFirst).toHaveBeenCalledTimes(1);
      expect(mockRedisClient.setEx).toHaveBeenCalled();

      // Reset the mock to simulate cache hit
      jest.clearAllMocks();
      mockRedisClient.get.mockResolvedValue(
        JSON.stringify(mockCharacterTransformedData),
      );

      // Second call - should hit cache
      const result2 = await service.findOne(characterId);

      expect(mockDb.query.characters.findFirst).not.toHaveBeenCalled(); // No DB call

      // Compare key properties
      expect(result1.id).toBe(result2.id);
      expect(result1.name).toBe(result2.name);
      expect(result1.episodes.length).toBe(result2.episodes.length);
    });
  });

  describe('update character workflow', () => {
    it('should update character and invalidate related caches', async () => {
      const characterId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateCharacterDto = {
        name: 'Luke Skywalker Updated',
      };

      // Mock findOne for validation (cached call)
      mockRedisClient.get.mockResolvedValue(
        JSON.stringify(mockCharacterTransformedData),
      );

      // Mock database update chain
      const mockUpdateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: characterId }]),
      };
      mockDb.update.mockReturnValue(mockUpdateChain);
      mockDb.query.characters.findFirst.mockResolvedValue({
        ...mockCharacterDatabaseData,
        name: 'Luke Skywalker Updated',
      });

      // Mock cache invalidation
      mockRedisClient.del.mockResolvedValue(1);
      mockRedisClient.keys.mockResolvedValue(['findAll_key1']);

      const result = await service.update(characterId, updateDto);

      // Verify update operations
      expect(mockUpdateChain.set).toHaveBeenCalledWith({
        ...updateDto,
        updatedAt: expect.any(Date),
      });

      // Verify specific character cache invalidation
      expect(mockRedisClient.del).toHaveBeenCalled();

      // Verify findAll cache pattern invalidation
      expect(mockRedisClient.keys).toHaveBeenCalledWith(
        '*characters_repository:CharactersRepository:findAll:*',
      );

      expect(result.name).toBe('Luke Skywalker Updated');
    });
  });

  describe('remove character workflow', () => {
    it('should remove character and invalidate related caches', async () => {
      const characterId = '123e4567-e89b-12d3-a456-426614174000';

      // Mock findOne for validation (cached call)
      mockRedisClient.get.mockResolvedValue(
        JSON.stringify(mockCharacterTransformedData),
      );

      // Mock database delete chain
      const mockDeleteChain = {
        where: jest.fn().mockResolvedValue(undefined),
      };
      mockDb.delete.mockReturnValue(mockDeleteChain);

      // Mock cache invalidation
      mockRedisClient.del.mockResolvedValue(1);
      mockRedisClient.keys.mockResolvedValue(['findAll_key1', 'findAll_key2']);

      await service.remove(characterId);

      // Verify delete operations
      expect(mockDeleteChain.where).toHaveBeenCalled();

      // Verify cache invalidation
      expect(mockRedisClient.del).toHaveBeenCalled();
      expect(mockRedisClient.keys).toHaveBeenCalledWith(
        '*characters_repository:CharactersRepository:findAll:*',
      );
    });
  });

  describe('error handling integration', () => {
    it('should handle database connection failures gracefully', async () => {
      const createDto: CreateCharacterDto = {
        name: 'Luke Skywalker',
        speciesId: '123e4567-e89b-12d3-a456-426614174001',
      };

      // Mock database failure
      mockDb.insert.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(service.create(createDto)).rejects.toThrow(
        'Failed to create character',
      );
    });

    it('should handle cache failures gracefully and still perform database operations', async () => {
      const createDto: CreateCharacterDto = {
        name: 'Luke Skywalker',
        speciesId: '123e4567-e89b-12d3-a456-426614174001',
      };

      // Mock successful database operations
      const mockInsertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest
          .fn()
          .mockResolvedValue([{ id: '123e4567-e89b-12d3-a456-426614174000' }]),
      };
      mockDb.insert.mockReturnValue(mockInsertChain);
      mockDb.query.characters.findFirst.mockResolvedValue(
        mockCharacterDatabaseData,
      );

      // Mock cache failure (but don't let it prevent database operations)
      mockRedisClient.keys.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      // Should still succeed despite cache failure
      const result = await service.create(createDto);

      expect(result).toMatchObject({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Luke Skywalker',
      });
    });

    it('should fall back to database when cache is unavailable', async () => {
      const query: CharacterQueryDto = { limit: 10, offset: 0 };

      // Mock cache unavailable
      mockRedisService.getClient.mockReturnValue(null);

      // Mock database query
      mockDb.query.characters.findMany.mockResolvedValue([
        mockCharacterDatabaseData,
      ]);

      const result = await service.findAll(query);

      // Should still get results from database
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Luke Skywalker');
      expect(mockDb.query.characters.findMany).toHaveBeenCalled();
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent cache operations', async () => {
      const characterId = '123e4567-e89b-12d3-a456-426614174000';

      // Mock database query
      mockDb.query.characters.findFirst.mockResolvedValue(
        mockCharacterDatabaseData,
      );

      // Mock cache miss for all concurrent calls
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.setEx.mockResolvedValue('OK');

      // Make concurrent calls
      const promises = Array(5)
        .fill(0)
        .map(() => service.findOne(characterId));
      const results = await Promise.all(promises);

      // All should return the same result
      results.forEach((result) => {
        expect(result.id).toBe(characterId);
        expect(result.name).toBe('Luke Skywalker');
      });

      // Database should be called for each miss (since cache is mocked as always missing)
      expect(mockDb.query.characters.findFirst).toHaveBeenCalledTimes(5);
    });
  });
});
