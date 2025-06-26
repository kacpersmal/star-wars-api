import { ApplicationError } from './application-error';
import { ErrorDomain } from './error-template';

export class ErrorFactory {
  static createNotFoundError(
    domain: ErrorDomain,
    message: string,
    context?: Record<string, any>,
  ) {
    return new ApplicationError(
      domain,
      'NOT_FOUND',
      message,
      404,
      true,
      context,
    );
  }

  static createInvalidInputError(
    domain: ErrorDomain,
    message: string,
    context?: Record<string, any>,
  ) {
    return new ApplicationError(
      domain,
      'INVALID_INPUT',
      message,
      400,
      true,
      context,
    );
  }

  static createUnauthorizedError(
    domain: ErrorDomain,
    message: string,
    context?: Record<string, any>,
  ) {
    return new ApplicationError(
      domain,
      'UNAUTHORIZED',
      message,
      401,
      true,
      context,
    );
  }

  static createForbiddenError(
    domain: ErrorDomain,
    message: string,
    context?: Record<string, any>,
  ) {
    return new ApplicationError(
      domain,
      'FORBIDDEN',
      message,
      403,
      true,
      context,
    );
  }

  static createNetworkTimeoutError(
    domain: ErrorDomain,
    message: string,
    context?: Record<string, any>,
  ) {
    return new ApplicationError(
      domain,
      'NETWORK_TIMEOUT',
      message,
      504,
      true,
      context,
    );
  }

  static createInternalError(
    domain: ErrorDomain,
    message: string,
    context?: Record<string, any>,
  ) {
    return new ApplicationError(
      domain,
      'INTERNAL_ERROR',
      message,
      500,
      false,
      context,
    );
  }

  static createServiceUnavailableError(
    domain: ErrorDomain,
    message: string,
    context?: Record<string, any>,
  ) {
    return new ApplicationError(
      domain,
      'SERVICE_UNAVAILABLE',
      message,
      503,
      true,
      context,
    );
  }
}
