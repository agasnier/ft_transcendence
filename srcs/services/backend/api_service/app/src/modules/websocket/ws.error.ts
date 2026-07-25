export const WS_ERRORS = {
  UNAUTHORIZED: {
    code: 4001,
    reason: 'Unauthorized',
    log: '[WS 001] Tentative de connexion non authentifiée. Fermeture immédiate.',
  },
  INVALID_JSON: {
    code: 4002,
    reason: 'Invalid JSON',
    log: '[WS 002] Format JSON invalide reçu.',
  },
} as const