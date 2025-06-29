import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GetSpeciesDto,
  GetSpeciesQueryDto,
} from 'src/features/species/actions/get-species/get-species.dto';
import { SpeciesRepository } from '../../repositories/species.repository';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
@QueryHandler(GetSpeciesQueryDto)
export class GetSpeciesHandler implements IQueryHandler<GetSpeciesQueryDto> {
  constructor(private readonly speciesRepository: SpeciesRepository) {}

  @Transactional()
  async execute(query: GetSpeciesQueryDto): Promise<GetSpeciesDto[]> {
    const { page = 0, limit = 10, search = '' } = query;
    const offset = page * limit;
    const species = await this.speciesRepository.getAll(limit, offset, search);

    return species.map((speciesItem) => ({
      id: speciesItem.id,
      name: speciesItem.name,
    }));
  }
}
