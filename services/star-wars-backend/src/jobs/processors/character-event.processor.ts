import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import {
  BaseEvent,
  CHARACTER_CREATED_EVENT,
  CharacterCreatedPayload,
} from 'src/shared/events/types';

@Processor('events')
export class CharacterEventProcessor {
  private readonly logger = new Logger(CharacterEventProcessor.name);

  @Process(CHARACTER_CREATED_EVENT)
  async handleCharacterCreated(job: Job<BaseEvent>): Promise<void> {
    const { payload, metadata } = job.data;
    const { id, name } = payload as CharacterCreatedPayload;

    this.logger.log(
      `Processing character-created event: Character "${name}" with ID "${id}" was created`,
      {
        correlationId: metadata?.correlationId,
        userId: metadata?.userId,
        source: metadata?.source,
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.logger.log(
      `Successfully processed character-created event for character: ${name} (ID: ${id})`,
      { correlationId: metadata?.correlationId },
    );
  }
}
