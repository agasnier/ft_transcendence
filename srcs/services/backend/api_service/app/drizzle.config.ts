import { readFileSync } from 'node:fs'

import { defineConfig } from 'drizzle-kit'


// charging the .env file into the process env
process.loadEnvFile(new URL('../../../../env/.env', import.meta.url))

// variable obligatoire : plante si absente ou vide
function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export default defineConfig({
  dialect: 'mysql',
  schema: './src/db/schema.ts',
  out: './src/db',
  dbCredentials: {
    host: '127.0.0.1',
    port: 3306,
    user: requireEnv('MARIADB_USER'),
    password: readFileSync(
      new URL('../../../../env/secrets/db_root_password.txt', import.meta.url),
      'utf8',
    ).trim(),
    database: requireEnv('MARIADB_DATABASE'),
  },
})
