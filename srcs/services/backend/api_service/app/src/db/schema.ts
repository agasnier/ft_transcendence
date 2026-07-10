import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const apiKeys = mysqlTable('api_keys', {
  id: int('id').autoincrement().primaryKey(),
  owner_id: int('owner_id').notNull(),
  api_key_hash: varchar('api_key_hash', { length: 255 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export type ApiKey = typeof apiKeys.$inferSelect
export type NewApiKey = typeof apiKeys.$inferInsert