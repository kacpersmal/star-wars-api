import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { CharactersController } from './controllers/characters.controller';
import { CharactersService } from './services/characters.service';
import { CharactersRepository } from './repositories/characters.repository';
import { createCachedProvider } from 'src/shared/utils/cache.util';

@Module({
  imports: [SharedModule],
  controllers: [CharactersController],
  providers: [
    CharactersService,
    CharactersRepository,
    createCachedProvider('CHARACTERS_REPOSITORY', CharactersRepository),
  ],
  exports: [
    CharactersService,
    CharactersRepository,
    'CACHED_CHARACTERS_REPOSITORY',
  ],
})
export class CharactersModule {}
