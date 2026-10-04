export type ErrorCode = 'INVALID_REQUEST' | 'METHOD_NOT_ALLOWED' | 'SERVER_CONFIGURATION_ERROR' | 'GEMINI_RATE_LIMITED' | 'GEMINI_ERROR' | 'SEARCH_TIMEOUT' | 'INTERNAL_ERROR' | 'ORIGIN_NOT_ALLOWED';
export class MentorError extends Error {
  constructor(public code: ErrorCode, public status: number, message: string) { super(message); }
}
export const timeoutError = () => new MentorError('SEARCH_TIMEOUT', 504, 'Mentor search exceeded its time limit. Try again.');
export function publicError(error: unknown): MentorError {
  return error instanceof MentorError ? error : new MentorError('INTERNAL_ERROR', 500, 'Unable to complete mentor search.');
}
