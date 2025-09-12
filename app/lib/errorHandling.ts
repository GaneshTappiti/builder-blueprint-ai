// Production-level error handling utilities
export enum ErrorCodes {
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface AppError {
  code: ErrorCodes;
  message: string;
  details?: any;
  timestamp: string;
  userId?: string;
  context?: string;
}

export class ChatError extends Error {
  public code: ErrorCodes;
  public details?: any;
  public context?: string;

  constructor(code: ErrorCodes, message: string, details?: any, context?: string) {
    super(message);
    this.name = 'ChatError';
    this.code = code;
    this.details = details;
    this.context = context;
  }
}

export function handleChatError(error: any, context?: string): AppError {
  const timestamp = new Date().toISOString();
  
  // Log error for monitoring
  console.error('Chat Error:', {
    error,
    context,
    timestamp,
    userAgent: navigator.userAgent,
    url: window.location.href
  });

  // Determine error type
  if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
    return {
      code: ErrorCodes.PERMISSION_DENIED,
      message: 'You do not have permission to perform this action',
      details: error,
      timestamp,
      context
    };
  }

  if (error.code === 'PGRST116' || error.message?.includes('not found')) {
    return {
      code: ErrorCodes.NOT_FOUND,
      message: 'The requested resource was not found',
      details: error,
      timestamp,
      context
    };
  }

  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return {
      code: ErrorCodes.NETWORK_ERROR,
      message: 'Network error. Please check your connection and try again.',
      details: error,
      timestamp,
      context
    };
  }

  if (error.message?.includes('rate limit') || error.message?.includes('too many requests')) {
    return {
      code: ErrorCodes.RATE_LIMITED,
      message: 'Too many requests. Please wait a moment and try again.',
      details: error,
      timestamp,
      context
    };
  }

  if (error.message?.includes('unauthorized') || error.message?.includes('invalid token')) {
    return {
      code: ErrorCodes.UNAUTHORIZED,
      message: 'Your session has expired. Please log in again.',
      details: error,
      timestamp,
      context
    };
  }

  // Default to internal error
  return {
    code: ErrorCodes.INTERNAL_ERROR,
    message: 'An unexpected error occurred. Please try again.',
    details: error,
    timestamp,
    context
  };
}

export function getErrorMessage(error: AppError): string {
  switch (error.code) {
    case ErrorCodes.NETWORK_ERROR:
      return 'Please check your internet connection and try again.';
    case ErrorCodes.PERMISSION_DENIED:
      return 'You do not have permission to perform this action.';
    case ErrorCodes.RATE_LIMITED:
      return 'Too many requests. Please wait a moment before trying again.';
    case ErrorCodes.UNAUTHORIZED:
      return 'Your session has expired. Please log in again.';
    case ErrorCodes.NOT_FOUND:
      return 'The requested item was not found.';
    case ErrorCodes.CONFLICT:
      return 'This action conflicts with existing data.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

export function shouldRetry(error: AppError): boolean {
  return error.code === ErrorCodes.NETWORK_ERROR || 
         error.code === ErrorCodes.RATE_LIMITED;
}

export function getRetryDelay(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attempt), 16000);
}
