import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApplicationError } from '../core/application-error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request.correlationId || 'unknown';

    let status: number;
    let message: string;
    let errorResponse: any;

    if (exception instanceof ApplicationError) {
      status = exception.statusCode;
      message = exception.message;

      const sanitizedContext = exception.context
        ? { ...exception.context }
        : undefined;
      if (sanitizedContext && 'originalError' in sanitizedContext) {
        delete sanitizedContext.originalError;
      }
      if (sanitizedContext && 'error' in sanitizedContext) {
        delete sanitizedContext.error;
      }

      errorResponse = {
        statusCode: status,
        timestamp: exception.timestamp.toISOString(),
        path: request.url,
        method: request.method,
        correlationId,
        error: {
          domain: exception.domain,
          code: exception.code,
          key: exception.key,
          message: exception.message,
          context: sanitizedContext,
        },
      };

      if (exception.isOperational) {
        this.logger.warn(`Operational error: ${exception.key} - ${message}`, {
          correlationId,
          domain: exception.domain,
          code: exception.code,
          statusCode: status,
          path: request.url,
          context: exception.context,
        });
      } else {
        this.logger.error(
          `System error: ${exception.key} - ${message}`,
          exception.stack,
          { correlationId },
        );
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || 'Http Exception';

      errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        correlationId,
        error: {
          message: Array.isArray(message) ? message : [message],
          error: exception.name,
        },
      };

      this.logger.warn(`HTTP Exception: ${status} - ${message}`, {
        correlationId,
        statusCode: status,
        path: request.url,
        exceptionResponse,
      });
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';

      errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        correlationId,
        error: {
          message: 'An unexpected error occurred',
        },
      };

      this.logger.error(
        `Unexpected error: ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
        { correlationId },
      );
    }

    response.status(status).json(errorResponse);
  }
}
