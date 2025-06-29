import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  CreateSpeciesDto,
  CreateSpeciesRequestDto,
} from 'src/features/species/actions/create-species/create-species.dto';
import { SpeciesRepository } from '../../repositories/species.repository';
import { ErrorFactory } from 'src/shared/errors/core/application-error.factory';
import { getErrorMessage } from 'src/shared/utils/error.util';

@Injectable()
@QueryHandler(CreateSpeciesRequestDto)
export class CreateSpeciesHandler
  implements IQueryHandler<CreateSpeciesRequestDto>
{
  constructor(private readonly speciesRepository: SpeciesRepository) {}

  async execute(command: CreateSpeciesRequestDto): Promise<CreateSpeciesDto> {
    const { name } = command;
    try {
      const newSpecies = await this.speciesRepository.create({ name });
      return new CreateSpeciesDto({
        id: newSpecies.id,
        name: newSpecies.name,
        createdAt: newSpecies.createdAt,
        updatedAt: newSpecies.updatedAt,
      });
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'SPECIES',
        'Failed to create species',
        {
          name,
          originalError: getErrorMessage(error),
        },
      );
    }
  }
}
