import { readFileSync } from 'node:fs'

function readPepper(path: string): string {
  return JSON.parse(readFileSync(path, 'utf8')).pepper
}

export const env = {
  host: '0.0.0.0',
  port: 3000,
  usersServiceUrl: 'http://users_service:3000',
  pepper: readPepper('/vault/secrets/pepper.json'),
} as const
