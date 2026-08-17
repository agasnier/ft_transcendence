export const env = {
  host: '0.0.0.0',
  port: 3000,
  vaultAgentUrl: 'http://users_service_agent:8100',
  accessTokenExpirationMinutes: 15,
  refreshTokenExpirationDays: 7,
} as const
