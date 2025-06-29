import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EpisodesController } from './episodes.controller';
import { EpisodesRepository } from './repositories/episodes.repository';
import { episodesHandlers } from './actions/episodes.handlers';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [CqrsModule, SharedModule],
  controllers: [EpisodesController],
  providers: [EpisodesRepository, ...episodesHandlers],
  exports: [EpisodesRepository],
})
export class EpisodesModule {}
