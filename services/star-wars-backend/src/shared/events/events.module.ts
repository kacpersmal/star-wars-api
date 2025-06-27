import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EventService } from './services/event.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'events',
    }),
  ],
  providers: [EventService],
  exports: [EventService, BullModule],
})
export class EventsModule {}
