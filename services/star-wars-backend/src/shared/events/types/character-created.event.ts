import { BaseEvent } from './base-event';

export interface CharacterCreatedPayload {
  readonly id: string;
  readonly name: string;
}

export const CHARACTER_CREATED_EVENT = 'character-created';
export class CharacterCreatedEvent implements BaseEvent {
  readonly type = CHARACTER_CREATED_EVENT;

  constructor(
    public readonly payload: CharacterCreatedPayload,
    public readonly metadata?: BaseEvent['metadata'],
  ) {}
}
