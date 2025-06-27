export interface BaseEvent {
  readonly type: string;
  readonly payload: Record<string, any>;
  readonly metadata?: {
    readonly correlationId?: string;
    readonly userId?: string;
    readonly timestamp?: Date;
    readonly source?: string;
    readonly version?: string;
  };
}

export interface EventOptions {
  attempts?: number;
  delay?: number;
  backoffType?: 'fixed' | 'exponential';
  priority?: number;
  correlationId?: string;
  userId?: string;
  source?: string;
}
