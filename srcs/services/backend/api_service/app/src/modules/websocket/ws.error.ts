export const WS_ERRORS = {
  UNAUTHORIZED: {
    code: 4001,
    reason: 'Unauthorized',
    log: '[WS 001] Unauthenticated connection attempt. Immediate closure.',
  },
  INVALID_JSON: {
    code: 4002,
    reason: 'Invalid JSON',
    log: '[WS 002] Invalid JSON format received.',
  },
} as const