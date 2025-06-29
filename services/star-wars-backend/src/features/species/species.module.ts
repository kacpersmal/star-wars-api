import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SpeciesController } from './species.controller';
import { SpeciesRepository } from './repositories/species.repository';
import { speciesHandlers } from './actions/species.handlers';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [CqrsModule, SharedModule],
  controllers: [SpeciesController],
  providers: [SpeciesRepository, ...speciesHandlers],
  exports: [SpeciesRepository],
})
export class SpeciesModule {}
