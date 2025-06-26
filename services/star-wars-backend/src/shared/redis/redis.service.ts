import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    try {
      const redisUrl =
        this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

      this.client = createClient({
        url: redisUrl,
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis connection error', error);
      });

      this.client.on('connect', () => {
        this.logger.log('Connected to Redis');
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
      this.client = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }

  getClient(): RedisClientType | null {
    if (!this.client) {
      this.logger.warn('Redis client is not connected');
      return null;
    }
    return this.client;
  }

  async isConnected(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }
}
