import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  UpdateEpisodeDto,
  UpdateEpisodeRequestDto,
} from './update-episode.dto';
import { EpisodesRepository } from 'src/features/episodes/repositories/episodes.repository';
import { ErrorFactory } from 'src/shared/errors/core/application-error.factory';
import { getErrorMessage } from 'src/shared/utils/error.util';

@Injectable()
@QueryHandler(UpdateEpisodeRequestDto)
export class UpdateEpisodeHandler
  implements IQueryHandler<UpdateEpisodeRequestDto>
{
  constructor(private readonly episodeRepository: EpisodesRepository) {}

  async execute(query: UpdateEpisodeRequestDto): Promise<UpdateEpisodeDto> {
    const { id, name, releaseDate } = query;

    const existingEpisode = await this.episodeRepository.getById(id);
    if (!existingEpisode) {
      throw ErrorFactory.createNotFoundError('EPISODES', 'Episode not found', {
        episodeId: id,
      });
    }

    try {
      const updatedEpisode = await this.episodeRepository.update(id, {
        name,
        date: releaseDate,
      });

      if (!updatedEpisode) {
        throw ErrorFactory.createInternalError(
          'EPISODES',
          'Failed to update episode',
          { episodeId: id },
        );
      }

      return {
        id: updatedEpisode.id,
        name: updatedEpisode.name,
        releaseDate: updatedEpisode.date,
        createdAt: updatedEpisode.createdAt,
        updatedAt: updatedEpisode.updatedAt,
      };
    } catch (error) {
      throw ErrorFactory.createInternalError(
        'EPISODES',
        'Failed to update episode',
        { episodeId: id, originalError: getErrorMessage(error) },
      );
    }
  }
}
