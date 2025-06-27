import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GetEpisodeByIdDto,
  GetEpisodeByIdQueryDto,
} from 'src/features/episodes/actions/get-episode-by-id/get-episode-by-id.dto';
import { EpisodesRepository } from 'src/features/episodes/repositories/episodes.repository';
import { ErrorFactory } from 'src/shared/errors/core/application-error.factory';
import { InjectCached } from 'src/shared/utils/inject-cached.decorator';

@Injectable()
@QueryHandler(GetEpisodeByIdQueryDto)
export class GetEpisodeByIdHandler
  implements IQueryHandler<GetEpisodeByIdQueryDto>
{
  constructor(
    @InjectCached('EPISODES_REPOSITORY')
    private readonly cachedEpisodesRepository: EpisodesRepository,
  ) {}
  async execute(query: GetEpisodeByIdQueryDto): Promise<GetEpisodeByIdDto> {
    const { id } = query;
    const episode = await this.cachedEpisodesRepository.getById(id);

    if (!episode) {
      throw ErrorFactory.createNotFoundError('EPISODES', 'Episode not found', {
        id,
      });
    }

    return {
      id: episode.id,
      name: episode.name,
      releaseDate: episode.date || '',
    };
  }
}
