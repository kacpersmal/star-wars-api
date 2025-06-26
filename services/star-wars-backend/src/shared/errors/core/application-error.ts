import { ErrorDomain, ErrorCode, ApplicationErrorKey } from './error-template';

export interface ErrorDetails {
  message: string;
  statusCode: number;
  isOperational: boolean;
  timestamp: Date;
  context?: Record<string, any>;
}

export class ApplicationError extends Error {
  public readonly domain: ErrorDomain;
  public readonly code: ErrorCode;
  public readonly key: ApplicationErrorKey;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    domain: ErrorDomain,
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>,
  ) {
    super(message);
    this.domain = domain;
    this.code = code;
    this.key = `${domain}_${code}`;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.context = context;
    this.name = 'ApplicationError';

    Error.captureStackTrace(this, ApplicationError);
  }

  toJSON() {
    return {
      name: this.name,
      domain: this.domain,
      code: this.code,
      key: this.key,
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }
}
