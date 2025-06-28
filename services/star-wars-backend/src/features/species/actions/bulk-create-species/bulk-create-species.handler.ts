import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  BulkCreateSpeciesDto,
  BulkCreateSpeciesRequestDto,
} from './bulk-create-species.dto';
import { SpeciesRepository } from '../../repositories/species.repository';
import { ErrorFactory } from 'src/shared/errors/core/application-error.factory';
import { TransactionContextService } from 'src/shared/database/transactions/transaction-context.service';
import { Species, species } from 'src/shared/database/schema';

@Injectable()
@QueryHandler(BulkCreateSpeciesRequestDto)
export class BulkCreateSpeciesHandler
  implements IQueryHandler<BulkCreateSpeciesRequestDto>
{
  constructor(
    private readonly speciesRepository: SpeciesRepository,
    private readonly transactionContext: TransactionContextService,
  ) {}

  async execute(
    command: BulkCreateSpeciesRequestDto,
  ): Promise<BulkCreateSpeciesDto> {
    const { species: speciesToCreate } = command;

    try {
      const result = await this.transactionContext.executeInTransaction(
        async (tx) => {
          const createdSpecies: Array<Species> = [];

          for (const speciesItem of speciesToCreate) {
            const existing = await tx.query.species.findFirst({
              where: (species, { eq }) => eq(species.name, speciesItem.name),
            });

            if (existing) {
              throw ErrorFactory.createConflictError(
                'SPECIES',
                `Species with name "${speciesItem.name}" already exists`,
                { name: speciesItem.name },
              );
            }
          }

          for (const speciesItem of speciesToCreate) {
            const [newSpecies] = await tx
              .insert(species)
              .values({
                name: speciesItem.name,
              })
              .returning();

            createdSpecies.push(newSpecies);
          }

          return createdSpecies;
        },
      );

      await this.speciesRepository.invalidateFindAllCache();

      return new BulkCreateSpeciesDto({
        species: result.map((s) => ({
          id: s.id,
          name: s.name,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        })),
        count: result.length,
      });
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'SPECIES',
        'Failed to bulk create species',
        {
          count: speciesToCreate.length,
          error: error instanceof Error ? error.message : String(error),
        },
      );
    }
  }
}
