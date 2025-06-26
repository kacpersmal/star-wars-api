import { Module } from '@nestjs/common';
import { CharactersModule } from './characters/characters.module';
import { EpisodesModule } from './episodes/episodes.module';
import { SpeciesModule } from './species/species.module';

@Module({
  imports: [CharactersModule, EpisodesModule, SpeciesModule],
})
export class FeaturesModule {}
