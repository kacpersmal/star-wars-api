import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DeleteSpeciesRequestDto } from 'src/features/species/actions/delete-species/delete-species.dto';
import { SpeciesRepository } from '../../repositories/species.repository';
import { ErrorFactory } from 'src/shared/errors/core/application-error.factory';

@Injectable()
@QueryHandler(DeleteSpeciesRequestDto)
export class DeleteSpeciesHandler
  implements IQueryHandler<DeleteSpeciesRequestDto>
{
  constructor(private readonly speciesRepository: SpeciesRepository) {}

  async execute(command: DeleteSpeciesRequestDto): Promise<void> {
    const { id } = command;

    const existingSpecies = await this.speciesRepository.getById(id);
    if (!existingSpecies) {
      throw ErrorFactory.createNotFoundError('SPECIES', 'Species not found', {
        id,
      });
    }

    try {
      await this.speciesRepository.delete(id);
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'SPECIES',
        'Failed to delete species',
        { id, error: error instanceof Error ? error.message : String(error) },
      );
    }
  }
}
