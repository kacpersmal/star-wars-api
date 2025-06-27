import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EpisodesController } from './episodes.controller';
import { EpisodesRepository } from './repositories/episodes.repository';
import { episodesHandlers } from './actions/episodes.handlers';
import { SharedModule } from 'src/shared/shared.module';
import { createCachedProvider } from 'src/shared/utils/cache.util';

@Module({
  imports: [CqrsModule, SharedModule],
  controllers: [EpisodesController],
  providers: [
    EpisodesRepository,
    createCachedProvider('EPISODES_REPOSITORY', EpisodesRepository),
    ...episodesHandlers,
  ],
  exports: [EpisodesRepository],
})
export class EpisodesModule {}
