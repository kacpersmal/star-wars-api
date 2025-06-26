/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'reflect-metadata';

// Global test setup
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    // Uncomment below to silence console outputs during tests
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

// Global test helpers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeUUID(): R;
      toBeISODate(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeUUID(received: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },

  toBeISODate(received: string) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime()) && received === date.toISOString();

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ISO date string`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ISO date string`,
        pass: false,
      };
    }
  },
});

// Mock implementation helpers
export const createMockDatabase = () => ({
  insert: jest.fn().mockReturnValue({
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  }),
  update: jest.fn().mockReturnValue({
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  }),
  delete: jest.fn().mockReturnValue({
    where: jest.fn(),
  }),
  query: {
    characters: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    species: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    episodes: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
});

export const createMockRedisClient = () => ({
  get: jest.fn(),
  set: jest.fn(),
  setEx: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  flushDb: jest.fn(),
  exists: jest.fn(),
  ping: jest.fn().mockResolvedValue('PONG'),
});

export const createMockCharacter = (overrides = {}) => ({
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
  ...overrides,
});

export const createMockCharacterData = (overrides = {}) => ({
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
  ...overrides,
});

// Test utilities
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const expectApplicationError = (
  error: any,
  domain: string,
  code: string,
  statusCode?: number,
) => {
  expect(error.domain).toBe(domain);
  expect(error.code).toBe(code);
  if (statusCode) {
    expect(error.statusCode).toBe(statusCode);
  }
  expect(error.isOperational).toBeDefined();
  expect(error.timestamp).toBeInstanceOf(Date);
};
