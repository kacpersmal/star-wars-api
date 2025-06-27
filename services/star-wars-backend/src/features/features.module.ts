import { Module } from '@nestjs/common';
import { CharactersModule } from './characters/characters.module';
import { EpisodesModule } from './episodes/episodes.module';
import { SpeciesModule } from './species/species.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CharactersModule,
    EpisodesModule,
    SpeciesModule,
    CqrsModule.forRoot(),
  ],
})
export class FeaturesModule {}
