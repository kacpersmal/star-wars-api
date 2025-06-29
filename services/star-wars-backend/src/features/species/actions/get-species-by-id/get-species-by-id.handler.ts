import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GetSpeciesByIdDto,
  GetSpeciesByIdQueryDto,
} from 'src/features/species/actions/get-species-by-id/get-species-by-id.dto';
import { SpeciesRepository } from '../../repositories/species.repository';
import { ErrorFactory } from 'src/shared/errors/core/application-error.factory';

@Injectable()
@QueryHandler(GetSpeciesByIdQueryDto)
export class GetSpeciesByIdHandler
  implements IQueryHandler<GetSpeciesByIdQueryDto>
{
  constructor(private readonly speciesRepository: SpeciesRepository) {}

  async execute(query: GetSpeciesByIdQueryDto): Promise<GetSpeciesByIdDto> {
    const species = await this.speciesRepository.getById(query.id);

    if (!species) {
      throw ErrorFactory.createNotFoundError('SPECIES', 'Species not found', {
        id: query.id,
      });
    }

    return new GetSpeciesByIdDto({
      id: species.id,
      name: species.name,
      createdAt: species.createdAt,
      updatedAt: species.updatedAt,
    });
  }
}
