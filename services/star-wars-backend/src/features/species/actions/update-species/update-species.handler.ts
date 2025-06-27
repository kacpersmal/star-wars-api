import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  UpdateSpeciesDto,
  UpdateSpeciesRequestDto,
} from 'src/features/species/actions/update-species/update-species.dto';
import { SpeciesRepository } from '../../repositories/species.repository';
import { ErrorFactory } from 'src/shared/errors/core/application-error.factory';

@Injectable()
@QueryHandler(UpdateSpeciesRequestDto)
export class UpdateSpeciesHandler
  implements IQueryHandler<UpdateSpeciesRequestDto>
{
  constructor(private readonly speciesRepository: SpeciesRepository) {}

  async execute(command: UpdateSpeciesRequestDto): Promise<UpdateSpeciesDto> {
    const { id, name } = command;

    const existingSpecies = await this.speciesRepository.getById(id);
    if (!existingSpecies) {
      throw ErrorFactory.createNotFoundError('SPECIES', 'Species not found', {
        id,
      });
    }

    try {
      const updatedSpecies = await this.speciesRepository.update(id, { name });

      if (!updatedSpecies) {
        throw ErrorFactory.createInternalError(
          'SPECIES',
          'Failed to update species',
          { id, name },
        );
      }

      return new UpdateSpeciesDto({
        id: updatedSpecies.id,
        name: updatedSpecies.name,
        createdAt: updatedSpecies.createdAt,
        updatedAt: updatedSpecies.updatedAt,
      });
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'SPECIES',
        'Failed to update species',
        {
          id,
          name,
          error: error instanceof Error ? error.message : String(error),
        },
      );
    }
  }
}
