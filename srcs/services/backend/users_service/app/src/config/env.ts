import { readFileSync } from 'node:fs'

function readVaultSecret(path: string, field: string): string {
  return JSON.parse(readFileSync(path, 'utf8'))[field]
}

export const env = {
  host: '0.0.0.0',
  port: 3000,
  vaultAgentUrl: 'http://users_service_agent:8100',
  pepper: readVaultSecret('/vault/secrets/pepper.json', 'pepper'),
  jwtPrivateKey: readVaultSecret('/vault/secrets/jwt_private.json', 'privateKey'),
  jwtPublicKey: readVaultSecret('/vault/secrets/jwt_public.json', 'publicKey'),
  accessTokenExpiration: '15m',
  refreshTokenExpirationDays: 7,
} as const
