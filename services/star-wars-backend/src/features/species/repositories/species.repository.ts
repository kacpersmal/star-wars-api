import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/shared/database/database.service';
import { CacheService } from 'src/shared/redis/cache/cache.service';
import { and, eq, ilike, sql } from 'drizzle-orm';
import { species } from 'src/shared/database/schema';
import { CacheProxy } from 'src/shared/redis/cache/cache-proxy.decorator';
import { getErrorMessage } from 'src/shared/utils/error.util';

export interface CreateSpeciesDto {
  name: string;
}

export interface UpdateSpeciesDto {
  name?: string;
}

@Injectable()
export class SpeciesRepository {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  @CacheProxy(300)
  async getAll(limit?: number, offset?: number, search?: string) {
    const db = this.databaseService.getDb();
    const conditions: any[] = [];

    if (search) {
      conditions.push(ilike(species.name, `%${search}%`));
    }

    const speciesData = await db.query.species.findMany({
      limit,
      offset,
      where: conditions.length > 0 ? and(...conditions) : undefined,
    });

    return speciesData;
  }

  @CacheProxy(60)
  async getById(speciesId: string) {
    const db = this.databaseService.getDb();
    const speciesData = await db.query.species.findFirst({
      where: eq(species.id, speciesId),
    });

    return speciesData;
  }

  async create(createSpeciesDto: CreateSpeciesDto) {
    const db = this.databaseService.getDb();

    try {
      const [newSpecies] = await db
        .insert(species)
        .values({
          name: createSpeciesDto.name,
        })
        .returning();

      await this.invalidateFindAllCache();

      const createdSpecies = await this.getById(newSpecies.id);
      return createdSpecies;
    } catch (error) {
      throw new Error(`Failed to create species: ${getErrorMessage(error)}`);
    }
  }

  async update(speciesId: string, updateSpeciesDto: UpdateSpeciesDto) {
    const db = this.databaseService.getDb();

    try {
      const [updatedSpecies] = await db
        .update(species)
        .set({
          name: updateSpeciesDto.name,
          updatedAt: new Date(),
        })
        .where(eq(species.id, speciesId))
        .returning();

      await this.invalidateSpeciesCache(speciesId);
      await this.invalidateFindAllCache();

      const speciesData = await this.getById(updatedSpecies.id);
      return speciesData;
    } catch (error) {
      throw new Error(`Failed to update species: ${getErrorMessage(error)}`);
    }
  }

  async delete(speciesId: string) {
    const db = this.databaseService.getDb();

    try {
      await db.delete(species).where(eq(species.id, speciesId));

      await this.invalidateSpeciesCache(speciesId);
      await this.invalidateFindAllCache();

      return true;
    } catch (error) {
      throw new Error(`Failed to delete species: ${getErrorMessage(error)}`);
    }
  }

  async findByName(name: string) {
    const db = this.databaseService.getDb();

    const speciesData = await db.query.species.findFirst({
      where: eq(species.name, name),
    });

    return speciesData;
  }

  async exists(speciesId: string): Promise<boolean> {
    const db = this.databaseService.getDb();

    const speciesData = await db.query.species.findFirst({
      where: eq(species.id, speciesId),
      columns: { id: true },
    });

    return !!speciesData;
  }

  async count(search?: string): Promise<number> {
    const db = this.databaseService.getDb();
    const conditions: any[] = [];

    if (search) {
      conditions.push(ilike(species.name, `%${search}%`));
    }

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(species)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result[0]?.count || 0;
  }

  private async invalidateSpeciesCache(speciesId: string): Promise<void> {
    try {
      const findOneKey = this.cacheService.generateCacheKey({
        keyPrefix: 'species_repository',
        className: 'SpeciesRepository',
        methodName: 'getById',
        args: [speciesId],
      });

      await this.cacheService.del(findOneKey);
    } catch (error) {
      console.warn(
        `Failed to invalidate species cache for ID ${speciesId}:`,
        getErrorMessage(error),
      );
    }
  }

  async invalidateFindAllCache(): Promise<void> {
    try {
      const pattern = '*species_repository:SpeciesRepository:getAll:*';
      await this.cacheService.invalidatePattern(pattern);
    } catch (error) {
      console.warn(
        'Failed to invalidate species findAll cache:',
        getErrorMessage(error),
      );
    }
  }
}
