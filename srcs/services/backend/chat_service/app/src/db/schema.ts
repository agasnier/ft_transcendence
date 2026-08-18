import { mysqlTable, int, varchar, timestamp, mysqlEnum, unique, bigint } from 'drizzle-orm/mysql-core'

export const channels = mysqlTable('channels', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).unique(),
  type: varchar('type', { length: 32 }).notNull(),
  description: varchar('description', { length: 255 }),
  writeMode: mysqlEnum('write_mode', ['everyone', 'moderators_only']).notNull().default('everyone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const channelMembers = mysqlTable('channel_members', {
  id: int('id').autoincrement().primaryKey(),
  channelId: int('channel_id')
    .notNull()
    .references(() => channels.id, { onDelete: 'cascade' }),
  userId: int('user_id').notNull(),
  role: mysqlEnum('role', ['moderator', 'member']).notNull().default('member'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  lastReadMessageId: int('last_read_message_id'),
}, (table) => ({
  uniqueMember: unique().on(table.channelId, table.userId),
}))

export const discussionPairs = mysqlTable('discussion_pairs', {
  id: int('id').autoincrement().primaryKey(),
  channelId: int('channel_id')
    .notNull()
    .references(() => channels.id, { onDelete: 'cascade' }),
  userMinId: int('user_min_id').notNull(),
  userMaxId: int('user_max_id').notNull(),
}, (table) => ({
  uniquePair: unique().on(table.userMinId, table.userMaxId),
}))

export const messages = mysqlTable('messages', {
  id: int('id').autoincrement().primaryKey(),
  channelId: int('channel_id')
    .notNull()
    .references(() => channels.id, { onDelete: 'cascade' }),
  senderId: int('sender_id').notNull(),
  content: varchar('content', { length: 2000 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  type: mysqlEnum('type', ['user', 'system']).default('user').notNull(),
})

export const files = mysqlTable('files', {
  id: int('id').autoincrement().primaryKey(),
  channelId: int('channel_id')
    .notNull()
    .references(() => channels.id, { onDelete: 'cascade' }),
  uploaderId: int('uploader_id').notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  storedName: varchar('stored_name', { length: 255 }).notNull().unique(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: bigint('size', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type FileRow = typeof files.$inferSelect
export type NewFileRow = typeof files.$inferInsert
export type Channel = typeof channels.$inferSelect
export type NewChannel = typeof channels.$inferInsert
export type ChannelMember = typeof channelMembers.$inferSelect
export type NewChannelMember = typeof channelMembers.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
