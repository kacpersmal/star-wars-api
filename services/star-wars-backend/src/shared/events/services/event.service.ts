import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BaseEvent, EventOptions } from '../types/base-event';
import { REQUEST } from '@nestjs/core/router/request/request-constants';
import { Request } from 'express';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectQueue('events') private eventsQueue: Queue,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async publish<T extends Record<string, any>>(
    eventType: string,
    payload: T,
    options: EventOptions = {},
  ): Promise<void> {
    const {
      attempts = 3,
      delay = 0,
      backoffType = 'exponential',
      priority = 0,
      correlationId,
      userId,
      source = 'api',
    } = options;
    const finalCorrelationId =
      correlationId ||
      this.request.correlationId ||
      this.generateCorrelationId();

    const event: BaseEvent = {
      type: eventType,
      payload,
      metadata: {
        correlationId: finalCorrelationId,
        userId,
        timestamp: new Date(),
        source,
        version: '1.0',
      },
    };

    try {
      await this.eventsQueue.add(eventType, event, {
        attempts,
        delay,
        priority,
        backoff: {
          type: backoffType,
          delay: backoffType === 'exponential' ? 2000 : delay || 1000,
        },
      });

      this.logger.log(`Published ${eventType} event`, {
        correlationId: event.metadata?.correlationId,
        userId: event.metadata?.userId,
        source: event.metadata?.source,
      });
    } catch (error) {
      this.logger.error(
        `Failed to publish ${eventType} event: ${error instanceof Error ? error.message : String(error)}`,
        {
          correlationId: event.metadata?.correlationId,
          error: error instanceof Error ? error.stack : undefined,
        },
      );
      throw error;
    }
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
