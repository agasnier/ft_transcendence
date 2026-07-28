import { mysqlTable, int, text, timestamp } from 'drizzle-orm/mysql-core'

export const messages = mysqlTable('messages', {
  id: int('id').autoincrement().primaryKey(),
  senderId: int('sender_id').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
