import { migrate } from 'drizzle-orm/mysql2/migrator'

import { db } from './index.js'

export async function runMigrations(): Promise<void> {
  await migrate(db, {
    migrationsFolder: './drizzle',
    migrationsTable: '__drizzle_migrations_api',
  })
}
