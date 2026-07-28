export const env = {
  host: '0.0.0.0',
  port: 3000,
  usersServiceUrl: 'http://users_service:3000',
  vaultAgentUrl: 'http://api_service_agent:8100',
  apiKeyExpirationDays: 15,
} as const
