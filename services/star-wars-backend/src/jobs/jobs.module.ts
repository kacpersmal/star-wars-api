import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CharacterEventProcessor } from './processors/character-event.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'events',
    }),
  ],
  providers: [CharacterEventProcessor],
})
export class JobsModule {}
