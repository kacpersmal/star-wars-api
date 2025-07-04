export type ErrorDomain =
  | 'SYSTEM'
  | 'CHARACTERS'
  | 'EPISODES'
  | 'SPECIES'
  | 'DATABASE'
  | 'REPOSITORY';

export type ErrorCode =
  | 'NOT_FOUND'
  | 'INVALID_INPUT'
  | 'NETWORK_TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'CONFLICT';

export type ApplicationErrorKey = `${ErrorDomain}_${ErrorCode}`;
