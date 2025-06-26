/**
 * Extracts a string message from any error type
 * @param error - The error to extract message from
 * @returns A string representation of the error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return String(error);
}

/**
 * Extracts error details for logging/debugging purposes
 * @param error - The error to extract details from
 * @returns An object with error details
 */
export function getErrorDetails(error: unknown): {
  message: string;
  name?: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return {
    message: getErrorMessage(error),
  };
}
