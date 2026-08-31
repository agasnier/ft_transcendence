import { mysqlTable, int, varchar, timestamp, mysqlEnum, unique, bigint } from 'drizzle-orm/mysql-core'

// Channels table: covers all conversation types (discussions, groups, and moderated channels).
// The "type" column determines behavior elsewhere (discussions don't use channelMembers the same way as groups/channels).
export const channels = mysqlTable('channels', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).unique(),
  type: varchar('type', { length: 32 }).notNull(),
  description: varchar('description', { length: 255 }),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  writeMode: mysqlEnum('write_mode', ['everyone', 'moderators_only']).notNull().default('everyone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Membership table: links a user to a channel with a local role.
// "role" here is scoped to this channel only (not the global user role stored in users_service).
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

// Maps a 1-to-1 discussion channel to the two participants involved.
// This is the permanent source of truth for "who is this discussion between",
// independent of whether either side currently has a channelMembers row
// (a user can leave/hide a discussion without deleting the pair, so it can be reopened later).
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

// Uploaded files (images, documents) attached to messages within a channel.
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

// Messages sent within a channel. Can be a regular user message or a system-generated
// notice (e.g. "user X created the group"), distinguished by "type".
export const messages = mysqlTable('messages', {
  id: int('id').autoincrement().primaryKey(),
  channelId: int('channel_id')
    .notNull()
    .references(() => channels.id, { onDelete: 'cascade' }),
  senderId: int('sender_id').notNull(),
  content: varchar('content', { length: 2000 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  type: mysqlEnum('type', ['user', 'system']).default('user').notNull(),
  fileId: int('file_id').references(() => files.id, { onDelete: 'set null' }),
})

export type FileRow = typeof files.$inferSelect
export type NewFileRow = typeof files.$inferInsert
export type Channel = typeof channels.$inferSelect
export type NewChannel = typeof channels.$inferInsert
export type ChannelMember = typeof channelMembers.$inferSelect
export type NewChannelMember = typeof channelMembers.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
