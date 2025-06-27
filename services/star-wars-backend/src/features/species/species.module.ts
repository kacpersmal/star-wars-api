import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SpeciesController } from './species.controller';
import { SpeciesRepository } from './repositories/species.repository';
import { speciesHandlers } from './actions/species.handlers';
import { SharedModule } from 'src/shared/shared.module';
import { createCachedProvider } from 'src/shared/utils/cache.util';

@Module({
  imports: [CqrsModule, SharedModule],
  controllers: [SpeciesController],
  providers: [
    SpeciesRepository,
    createCachedProvider('SPECIES_REPOSITORY', SpeciesRepository),
    ...speciesHandlers,
  ],
  exports: [SpeciesRepository],
})
export class SpeciesModule {}
