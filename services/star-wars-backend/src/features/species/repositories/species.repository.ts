import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/shared/database/database.service';
import { CacheService } from 'src/shared/redis/cache/cache.service';
import { AbstractRepository } from 'src/shared/repositories/abstract.repository';
import { and, eq, ilike, sql, type SQL } from 'drizzle-orm';
import { species } from 'src/shared/database/schema';
import { TypedCache } from 'src/shared/redis/cache/typed-cache.decorator';
import { getErrorMessage } from 'src/shared/utils/error.util';

export interface CreateSpeciesDto {
  name: string;
}

export interface UpdateSpeciesDto {
  name?: string;
}

@Injectable()
export class SpeciesRepository extends AbstractRepository {
  constructor(databaseService: DatabaseService, cacheService: CacheService) {
    super(databaseService, cacheService);
  }

  @TypedCache({ ttl: 300 })
  async getAll(limit?: number, offset?: number, search?: string) {
    const conditions: SQL<unknown>[] = [];

    if (search) {
      conditions.push(ilike(species.name, `%${search}%`));
    }

    const speciesData = await this.db.query.species.findMany({
      limit,
      offset,
      where: conditions.length > 0 ? and(...conditions) : undefined,
    });

    return speciesData;
  }

  @TypedCache({ ttl: 60 })
  async getById(speciesId: string) {
    const speciesData = await this.db.query.species.findFirst({
      where: eq(species.id, speciesId),
    });

    return speciesData;
  }

  async create(createSpeciesDto: CreateSpeciesDto) {
    try {
      const [newSpecies] = await this.db
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
    try {
      const [updatedSpecies] = await this.db
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
    try {
      await this.db.delete(species).where(eq(species.id, speciesId));

      await this.invalidateSpeciesCache(speciesId);
      await this.invalidateFindAllCache();

      return true;
    } catch (error) {
      throw new Error(`Failed to delete species: ${getErrorMessage(error)}`);
    }
  }

  async findByName(name: string) {
    const speciesData = await this.db.query.species.findFirst({
      where: eq(species.name, name),
    });

    return speciesData;
  }

  async exists(speciesId: string): Promise<boolean> {
    const speciesData = await this.db.query.species.findFirst({
      where: eq(species.id, speciesId),
      columns: { id: true },
    });

    return !!speciesData;
  }

  async count(search?: string): Promise<number> {
    const conditions: SQL<unknown>[] = [];

    if (search) {
      conditions.push(ilike(species.name, `%${search}%`));
    }

    const result = await this.db
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
