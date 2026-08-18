import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const apiKeys = mysqlTable('api_keys', {
  id: int('id').autoincrement().primaryKey(),
  owner_id: int('owner_id').notNull(),
  api_key_hash: varchar('api_key_hash', { length: 255 }).notNull(),
  expires_at: timestamp('expires_at').notNull(),
})

export type ApiKey = typeof apiKeys.$inferSelect
export type NewApiKey = typeof apiKeys.$inferInsert