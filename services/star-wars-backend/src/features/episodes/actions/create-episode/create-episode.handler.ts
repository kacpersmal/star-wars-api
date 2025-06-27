import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  CreateEpisodeDto,
  CreateEpisodeRequestDto,
} from 'src/features/episodes/actions/create-episode/create-episode.dto';
import { EpisodesRepository } from 'src/features/episodes/repositories/episodes.repository';
import { ErrorFactory } from 'src/shared/errors/core/application-error.factory';

@Injectable()
@QueryHandler(CreateEpisodeRequestDto)
export class CreateEpisodeHandler
  implements IQueryHandler<CreateEpisodeRequestDto>
{
  constructor(private readonly episodeRepository: EpisodesRepository) {}

  async execute(query: CreateEpisodeRequestDto): Promise<CreateEpisodeDto> {
    const { name, releaseDate } = query;

    const ep = await this.episodeRepository.create({
      name,
      date: releaseDate,
    });

    if (!ep) {
      throw ErrorFactory.createInternalError(
        'EPISODES',
        'Failed to create episode',
        {
          name,
          releaseDate,
        },
      );
    }

    return {
      id: ep.id,
      name: ep.name,
      releaseDate: ep.date,
      createdAt: ep.createdAt,
      updatedAt: ep.updatedAt,
    };
  }
}
