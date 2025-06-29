import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { CharactersController } from './controllers/characters.controller';
import { CharactersService } from './services/characters.service';
import { CharactersRepository } from './repositories/characters.repository';

@Module({
  imports: [SharedModule],
  controllers: [CharactersController],
  providers: [CharactersService, CharactersRepository],
  exports: [CharactersService, CharactersRepository],
})
export class CharactersModule {}
