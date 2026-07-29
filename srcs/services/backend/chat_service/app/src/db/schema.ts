import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const channels = mysqlTable('channels', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const channelMembers = mysqlTable('channel_members', {
  id: int('id').autoincrement().primaryKey(),
  channelId: int('channel_id')
    .notNull()
    .references(() => channels.id, { onDelete: 'cascade' }),
  userId: int('user_id').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
})

export const messages = mysqlTable('messages', {
  id: int('id').autoincrement().primaryKey(),
  channelId: int('channel_id')
    .notNull()
    .references(() => channels.id, { onDelete: 'cascade' }),
  senderId: int('sender_id').notNull(),
  content: varchar('content', { length: 2000 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Channel = typeof channels.$inferSelect
export type NewChannel = typeof channels.$inferInsert
export type ChannelMember = typeof channelMembers.$inferSelect
export type NewChannelMember = typeof channelMembers.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
