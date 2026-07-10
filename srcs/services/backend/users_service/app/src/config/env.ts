import { readFileSync } from 'node:fs'

function readVaultSecret(path: string, field: string): string {
  return JSON.parse(readFileSync(path, 'utf8'))[field]
}

export const env = {
  host: '0.0.0.0',
  port: 3000,
  pepper: readVaultSecret('/vault/secrets/pepper.json', 'pepper'),
  jwtPrivateKey: readVaultSecret('/vault/secrets/jwt_private.json', 'privateKey'),
} as const
