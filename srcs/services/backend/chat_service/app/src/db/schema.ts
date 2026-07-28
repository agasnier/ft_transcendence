import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const channels = mysqlTable('channels', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
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

export type Channel = typeof channels.$inferSelect
export type NewChannel = typeof channels.$inferInsert
export type ChannelMember = typeof channelMembers.$inferSelect
export type NewChannelMember = typeof channelMembers.$inferInsert
