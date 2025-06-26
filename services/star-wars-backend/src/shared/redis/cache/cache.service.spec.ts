/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { RedisService } from '../redis.service';

describe('CacheService', () => {
  let service: CacheService;
  let redisService: jest.Mocked<RedisService>;

  const mockRedisClient = {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    flushDb: jest.fn(),
    exists: jest.fn(),
  };

  const mockRedisService = {
    getClient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    redisService = module.get(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return cached value when key exists', async () => {
      const testValue = { id: '1', name: 'Luke Skywalker' };
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.get.mockResolvedValue(JSON.stringify(testValue));

      const result = await service.get<typeof testValue>('test_key');

      expect(mockRedisClient.get).toHaveBeenCalledWith('test_key');
      expect(result).toEqual(testValue);
    });

    it('should return null when key does not exist', async () => {
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.get('test_key');

      expect(result).toBeNull();
    });

    it('should return null when Redis client is not available', async () => {
      mockRedisService.getClient.mockReturnValue(null);

      const result = await service.get('test_key');

      expect(result).toBeNull();
      expect(mockRedisClient.get).not.toHaveBeenCalled();
    });

    it('should return null and log error when Redis operation fails', async () => {
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.get.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      const result = await service.get('test_key');

      expect(result).toBeNull();
    });

    it('should handle JSON parse errors gracefully', async () => {
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.get.mockResolvedValue('invalid json {');

      const result = await service.get('test_key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value with TTL successfully', async () => {
      const testValue = { id: '1', name: 'Luke Skywalker' };
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.setEx.mockResolvedValue('OK');

      const result = await service.set('test_key', testValue, 300);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'test_key',
        300,
        JSON.stringify(testValue),
      );
      expect(result).toBe(true);
    });

    it('should use default TTL when not provided', async () => {
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.setEx.mockResolvedValue('OK');

      const result = await service.set('test_key', 'test_value');

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'test_key',
        60,
        JSON.stringify('test_value'),
      );
      expect(result).toBe(true);
    });

    it('should return false when Redis client is not available', async () => {
      mockRedisService.getClient.mockReturnValue(null);

      const result = await service.set('test_key', 'test_value');

      expect(result).toBe(false);
      expect(mockRedisClient.setEx).not.toHaveBeenCalled();
    });

    it('should return false and log error when Redis operation fails', async () => {
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.setEx.mockRejectedValue(new Error('Redis write failed'));

      const result = await service.set('test_key', 'test_value');

      expect(result).toBe(false);
    });
  });

  describe('del', () => {
    it('should delete key successfully', async () => {
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.del.mockResolvedValue(1);

      const result = await service.del('test_key');

      expect(mockRedisClient.del).toHaveBeenCalledWith('test_key');
      expect(result).toBe(true);
    });

    it('should return false when Redis client is not available', async () => {
      mockRedisService.getClient.mockReturnValue(null);

      const result = await service.del('test_key');

      expect(result).toBe(false);
    });
  });

  describe('getOrSet', () => {
    it('should return cached value when key exists', async () => {
      const cachedValue = { id: '1', name: 'Luke Skywalker' };
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedValue));

      const factory = jest.fn();
      const result = await service.getOrSet('test_key', factory, 300);

      expect(result).toEqual(cachedValue);
      expect(factory).not.toHaveBeenCalled();
    });

    it('should execute factory and cache result when key does not exist', async () => {
      const factoryValue = { id: '2', name: 'Princess Leia' };
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.setEx.mockResolvedValue('OK');

      const factory = jest.fn().mockResolvedValue(factoryValue);
      const result = await service.getOrSet('test_key', factory, 300);

      expect(factory).toHaveBeenCalled();
      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'test_key',
        300,
        JSON.stringify(factoryValue),
      );
      expect(result).toEqual(factoryValue);
    });

    it('should execute factory when cache get fails', async () => {
      const factoryValue = { id: '3', name: 'Han Solo' };
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.get.mockRejectedValue(new Error('Cache get failed'));
      mockRedisClient.setEx.mockResolvedValue('OK');

      const factory = jest.fn().mockResolvedValue(factoryValue);
      const result = await service.getOrSet('test_key', factory, 300);

      expect(factory).toHaveBeenCalled();
      expect(result).toEqual(factoryValue);
    });
  });

  describe('generateCacheKey', () => {
    it('should generate key with class and method', () => {
      const options = {
        keyPrefix: 'test',
        className: 'CharactersRepository',
        methodName: 'findOne',
        args: ['123'],
      };

      const result = service.generateCacheKey(options);

      expect(result).toMatch(/^test:CharactersRepository:findOne:/);
    });

    it('should generate key without class and method', () => {
      const options = {
        keyPrefix: 'test',
        args: ['arg1', 'arg2'],
      };

      const result = service.generateCacheKey(options);

      expect(result).toMatch(/^test:/);
    });

    it('should use default prefix when not provided', () => {
      const options = {
        className: 'TestClass',
        methodName: 'testMethod',
        args: [],
      };

      const result = service.generateCacheKey(options);

      expect(result).toMatch(/^cache:TestClass:testMethod:/);
    });

    it('should handle empty args', () => {
      const options = {
        keyPrefix: 'test',
        className: 'TestClass',
        methodName: 'testMethod',
        args: [],
      };

      const result = service.generateCacheKey(options);

      expect(result).toBe('test:TestClass:testMethod:no-args');
    });
  });

  describe('invalidatePattern', () => {
    it('should invalidate multiple keys matching pattern', async () => {
      const keys = ['key1', 'key2', 'key3'];
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.keys.mockResolvedValue(keys);
      mockRedisClient.del.mockResolvedValue(3);

      const result = await service.invalidatePattern('test:*');

      expect(mockRedisClient.keys).toHaveBeenCalledWith('test:*');
      expect(mockRedisClient.del).toHaveBeenCalledWith(keys);
      expect(result).toBe(3);
    });

    it('should return 0 when no keys match pattern', async () => {
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.keys.mockResolvedValue([]);

      const result = await service.invalidatePattern('test:*');

      expect(result).toBe(0);
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should return 0 when Redis client is not available', async () => {
      mockRedisService.getClient.mockReturnValue(null);

      const result = await service.invalidatePattern('test:*');

      expect(result).toBe(0);
    });
  });

  describe('invalidateClass', () => {
    it('should invalidate all methods for a class', async () => {
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.keys.mockResolvedValue([
        'cache:TestClass:method1',
        'cache:TestClass:method2',
      ]);
      mockRedisClient.del.mockResolvedValue(2);

      const result = await service.invalidateClass('TestClass');

      expect(mockRedisClient.keys).toHaveBeenCalledWith('cache:TestClass:*');
      expect(result).toBe(2);
    });

    it('should use custom key prefix', async () => {
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.keys.mockResolvedValue([]);

      await service.invalidateClass('TestClass', 'custom');

      expect(mockRedisClient.keys).toHaveBeenCalledWith('custom:TestClass:*');
    });
  });

  describe('invalidateMethod', () => {
    it('should invalidate specific method for a class', async () => {
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.keys.mockResolvedValue(['cache:TestClass:findOne:arg1']);
      mockRedisClient.del.mockResolvedValue(1);

      const result = await service.invalidateMethod('TestClass', 'findOne');

      expect(mockRedisClient.keys).toHaveBeenCalledWith(
        'cache:TestClass:findOne:*',
      );
      expect(result).toBe(1);
    });
  });

  describe('clearAll', () => {
    it('should clear all cache entries', async () => {
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.flushDb.mockResolvedValue('OK');

      const result = await service.clearAll();

      expect(mockRedisClient.flushDb).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when Redis client is not available', async () => {
      mockRedisService.getClient.mockReturnValue(null);

      const result = await service.clearAll();

      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.exists.mockResolvedValue(1);

      const result = await service.exists('test_key');

      expect(mockRedisClient.exists).toHaveBeenCalledWith('test_key');
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.exists.mockResolvedValue(0);

      const result = await service.exists('test_key');

      expect(result).toBe(false);
    });

    it('should return false when Redis client is not available', async () => {
      mockRedisService.getClient.mockReturnValue(null);

      const result = await service.exists('test_key');

      expect(result).toBe(false);
    });
  });

  describe('getKeys', () => {
    it('should return keys matching pattern', async () => {
      const keys = ['key1', 'key2'];
      mockRedisService.getClient.mockReturnValue(mockRedisClient as any);
      mockRedisClient.keys.mockResolvedValue(keys);

      const result = await service.getKeys('test:*');

      expect(mockRedisClient.keys).toHaveBeenCalledWith('test:*');
      expect(result).toEqual(keys);
    });

    it('should return empty array when Redis client is not available', async () => {
      mockRedisService.getClient.mockReturnValue(null);

      const result = await service.getKeys('test:*');

      expect(result).toEqual([]);
    });
  });

  describe('argument hashing', () => {
    it('should generate consistent hash for same arguments', () => {
      const args = [{ id: '1', name: 'test' }, 'string', 123];

      const key1 = service.generateCacheKey({
        keyPrefix: 'test',
        className: 'Test',
        methodName: 'method',
        args,
      });

      const key2 = service.generateCacheKey({
        keyPrefix: 'test',
        className: 'Test',
        methodName: 'method',
        args,
      });

      expect(key1).toBe(key2);
    });

    it('should generate different hash for different arguments', () => {
      const args1 = [{ id: '1' }];
      const args2 = [{ id: '2' }];

      const key1 = service.generateCacheKey({
        keyPrefix: 'test',
        className: 'Test',
        methodName: 'method',
        args: args1,
      });

      const key2 = service.generateCacheKey({
        keyPrefix: 'test',
        className: 'Test',
        methodName: 'method',
        args: args2,
      });

      expect(key1).not.toBe(key2);
    });

    it('should handle non-serializable arguments gracefully', () => {
      const circularRef: any = {};
      circularRef.self = circularRef;

      const result = service.generateCacheKey({
        keyPrefix: 'test',
        className: 'Test',
        methodName: 'method',
        args: [circularRef],
      });

      expect(result).toMatch(/^test:Test:method:args-1$/);
    });
  });
});
