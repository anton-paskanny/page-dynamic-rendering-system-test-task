import { ApiError } from '../services/BaseApiService';

/**
 * Formats error details array into a readable string
 * @param details - Array of error detail messages
 * @returns Formatted error details string
 */
export const formatErrorDetails = (details: string[]): string => {
  if (details.length === 0) return '';
  if (details.length === 1) return details[0];
  return details.join('; ');
};

/**
 * Extracts the most relevant error message from an error object
 * @param err - Error object (can be ApiError or generic Error)
 * @param context - Optional context to prepend to the error message
 * @returns Formatted error message string
 */
export const formatError = (err: unknown, context?: string): string => {
  let errorMessage: string;

  // Handle ApiError with details
  if (err instanceof ApiError) {
    errorMessage = err.details && err.details.length > 0
      ? `${err.errorType}: ${formatErrorDetails(err.details)}`
      : err.message;
  } else {
    // Handle generic errors
    errorMessage = err instanceof Error ? err.message : 'Unknown error';
  }

  // Add context if provided
  if (context) {
    errorMessage = `${context}: ${errorMessage}`;
  }

  return errorMessage;
};
