import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GetEpisodesDto,
  GetEpisodesQueryDto,
} from 'src/features/episodes/actions/get-episodes/get-episodes.dto';
import { EpisodesRepository } from '../../repositories/episodes.repository';

@Injectable()
@QueryHandler(GetEpisodesQueryDto)
export class GetEpisodesHandler implements IQueryHandler<GetEpisodesQueryDto> {
  constructor(private readonly episodesRepository: EpisodesRepository) {}

  async execute(query: GetEpisodesQueryDto): Promise<GetEpisodesDto[]> {
    const { page = 0, limit = 10, search = '' } = query;
    const offset = page * limit;
    const episodes = await this.episodesRepository.getAll(
      limit,
      offset,
      search,
    );

    return episodes.map((episode) => ({
      id: episode.id,
      title: episode.name,
      releaseDate: episode.date || '',
    }));
  }
}
