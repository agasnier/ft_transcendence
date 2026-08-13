export const env = {
  host: '0.0.0.0',
  port: 3000,
  vaultAgentUrl: 'http://chat_service_agent:8100',
  usersServiceUrl: 'http://users_service:3000',
  uploadsDir: '/app/uploads',
  maxFileSize: 10 * 1024 * 1024,
} as const
