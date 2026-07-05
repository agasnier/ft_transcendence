import { readFileSync } from 'node:fs'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  host: '0.0.0.0',
  port: 3000,
  db: {
    host: requireEnv('DB_HOST'),
    port: Number(requireEnv('DB_PORT')),
    user: requireEnv('MARIADB_USER'),
    password: readFileSync(process.env.DB_PASSWORD_FILE!, 'utf8').trim(),
    database: requireEnv('MARIADB_DATABASE'),
  },
} as const
