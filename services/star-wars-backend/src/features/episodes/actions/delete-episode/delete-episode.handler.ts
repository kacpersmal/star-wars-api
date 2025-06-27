import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DeleteEpisodeRequestDto } from './delete-episode.dto';
import { EpisodesRepository } from 'src/features/episodes/repositories/episodes.repository';
import { ErrorFactory } from 'src/shared/errors/core/application-error.factory';
import { getErrorMessage } from 'src/shared/utils/error.util';
import { InjectCached } from 'src/shared/utils/inject-cached.decorator';

@Injectable()
@QueryHandler(DeleteEpisodeRequestDto)
export class DeleteEpisodeHandler
  implements IQueryHandler<DeleteEpisodeRequestDto>
{
  constructor(
    private readonly episodeRepository: EpisodesRepository,
    @InjectCached('EPISODES_REPOSITORY')
    private readonly cachedEpisodesRepository: EpisodesRepository,
  ) {}

  async execute(query: DeleteEpisodeRequestDto): Promise<void> {
    const { id } = query;

    const existingEpisode = await this.cachedEpisodesRepository.getById(id);
    if (!existingEpisode) {
      throw ErrorFactory.createNotFoundError('EPISODES', 'Episode not found', {
        episodeId: id,
      });
    }

    try {
      await this.episodeRepository.remove(id);
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'EPISODES',
        'Failed to delete episode',
        { episodeId: id, originalError: getErrorMessage(error) },
      );
    }
  }
}
