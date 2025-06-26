/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getErrorMessage, getErrorDetails } from './error.util';

describe('Error Utils', () => {
  describe('getErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error message');
      const result = getErrorMessage(error);
      expect(result).toBe('Test error message');
    });

    it('should return string error as is', () => {
      const error = 'String error message';
      const result = getErrorMessage(error);
      expect(result).toBe('String error message');
    });

    it('should convert number to string', () => {
      const error = 404;
      const result = getErrorMessage(error);
      expect(result).toBe('404');
    });

    it('should convert object to string', () => {
      const error = { code: 'NOT_FOUND', message: 'Resource not found' };
      const result = getErrorMessage(error);
      expect(result).toBe('[object Object]');
    });

    it('should handle null and undefined', () => {
      expect(getErrorMessage(null)).toBe('null');
      expect(getErrorMessage(undefined)).toBe('undefined');
    });

    it('should handle boolean values', () => {
      expect(getErrorMessage(true)).toBe('true');
      expect(getErrorMessage(false)).toBe('false');
    });
  });

  describe('getErrorDetails', () => {
    it('should extract full details from Error object', () => {
      const error = new Error('Test error message');
      error.stack = 'Error: Test error message\n    at test.js:1:1';

      const result = getErrorDetails(error);

      expect(result).toEqual({
        message: 'Test error message',
        name: 'Error',
        stack: 'Error: Test error message\n    at test.js:1:1',
      });
    });

    it('should extract details from custom Error subclass', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const error = new CustomError('Custom error message');
      const result = getErrorDetails(error);

      expect(result).toEqual({
        message: 'Custom error message',
        name: 'CustomError',
        stack: expect.any(String),
      });
    });

    it('should handle string error', () => {
      const error = 'String error message';
      const result = getErrorDetails(error);

      expect(result).toEqual({
        message: 'String error message',
      });
    });

    it('should handle number error', () => {
      const error = 500;
      const result = getErrorDetails(error);

      expect(result).toEqual({
        message: '500',
      });
    });

    it('should handle object error', () => {
      const error = { code: 'INVALID_INPUT', details: 'Validation failed' };
      const result = getErrorDetails(error);

      expect(result).toEqual({
        message: '[object Object]',
      });
    });

    it('should handle null and undefined errors', () => {
      expect(getErrorDetails(null)).toEqual({
        message: 'null',
      });

      expect(getErrorDetails(undefined)).toEqual({
        message: 'undefined',
      });
    });

    it('should handle Error without stack', () => {
      const error = new Error('Test message');
      delete error.stack;

      const result = getErrorDetails(error);

      expect(result).toEqual({
        message: 'Test message',
        name: 'Error',
        stack: undefined,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle Error with empty message', () => {
      const error = new Error('');
      expect(getErrorMessage(error)).toBe('');
      expect(getErrorDetails(error).message).toBe('');
    });

    it('should handle Error with only whitespace message', () => {
      const error = new Error('   ');
      expect(getErrorMessage(error)).toBe('   ');
      expect(getErrorDetails(error).message).toBe('   ');
    });

    it('should handle circular reference objects', () => {
      const error: any = {};
      error.self = error;

      const message = getErrorMessage(error);
      const details = getErrorDetails(error);

      expect(message).toBe('[object Object]');
      expect(details.message).toBe('[object Object]');
    });

    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(10000);
      const error = new Error(longMessage);

      expect(getErrorMessage(error)).toBe(longMessage);
      expect(getErrorDetails(error).message).toBe(longMessage);
    });

    it('should handle errors with special characters', () => {
      const specialMessage = 'Error with 特殊字符 and émojis 🚀💥';
      const error = new Error(specialMessage);

      expect(getErrorMessage(error)).toBe(specialMessage);
      expect(getErrorDetails(error).message).toBe(specialMessage);
    });
  });
});
