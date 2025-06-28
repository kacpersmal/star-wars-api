import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/shared/database/database.service';
import { CacheService } from 'src/shared/redis/cache/cache.service';
import { AbstractRepository } from 'src/shared/repositories/abstract.repository';
import { and, eq, ilike, type SQL } from 'drizzle-orm';
import { episodes } from 'src/shared/database/schema';
import { TypedCache } from 'src/shared/redis/cache/typed-cache.decorator';
import { getErrorMessage } from 'src/shared/utils/error.util';

export interface CreateEpisodeDto {
  name: string;
  date?: string;
}

export interface UpdateEpisodeDto {
  name?: string;
  date?: string;
}

@Injectable()
export class EpisodesRepository extends AbstractRepository {
  constructor(databaseService: DatabaseService, cacheService: CacheService) {
    super(databaseService, cacheService);
  }

  @TypedCache({ ttl: 300 })
  async getAll(limit?: number, offset?: number, search?: string) {
    const conditions: SQL<unknown>[] = [];

    if (search) {
      conditions.push(ilike(episodes.name, `%${search}%`));
    }

    const episodesData = await this.db.query.episodes.findMany({
      limit,
      offset,
      where: conditions.length > 0 ? and(...conditions) : undefined,
    });

    return episodesData;
  }

  @TypedCache({ ttl: 60 })
  async getById(episodeId: string) {
    const episodeData = await this.db.query.episodes.findFirst({
      where: eq(episodes.id, episodeId),
    });

    return episodeData;
  }

  async create(createEpisodeDto: CreateEpisodeDto) {
    const [newEpisode] = await this.db
      .insert(episodes)
      .values({
        name: createEpisodeDto.name,
        date: createEpisodeDto.date,
      })
      .returning();

    await this.invalidateFindAllCache();

    const createdEpisode = await this.getById(newEpisode.id);
    return createdEpisode;
  }

  async update(id: string, updateEpisodeDto: UpdateEpisodeDto) {
    const [updatedEpisode] = await this.db
      .update(episodes)
      .set({
        ...updateEpisodeDto,
        updatedAt: new Date(),
      })
      .where(eq(episodes.id, id))
      .returning();

    await this.invalidateEpisodeCache(id);
    await this.invalidateFindAllCache();

    const episode = await this.getById(updatedEpisode.id);
    return episode;
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(episodes).where(eq(episodes.id, id));

    await this.invalidateEpisodeCache(id);
    await this.invalidateFindAllCache();
  }

  private async invalidateEpisodeCache(episodeId: string): Promise<void> {
    try {
      const findOneKey = this.cacheService.generateCacheKey({
        keyPrefix: 'episodes_repository',
        className: 'EpisodesRepository',
        methodName: 'getById',
        args: [episodeId],
      });

      await this.cacheService.del(findOneKey);
    } catch (error) {
      console.warn(
        `Failed to invalidate episode cache for ID ${episodeId}:`,
        getErrorMessage(error),
      );
    }
  }

  private async invalidateFindAllCache(): Promise<void> {
    try {
      const pattern = '*episodes_repository:EpisodesRepository:getAll:*';
      await this.cacheService.invalidatePattern(pattern);
    } catch (error) {
      console.warn(
        'Failed to invalidate episodes findAll cache:',
        getErrorMessage(error),
      );
    }
  }
}
