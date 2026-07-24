import { mysqlTable, int, varchar, text, mysqlEnum, timestamp, boolean, unique } from 'drizzle-orm/mysql-core'

// SQL table that stores users content
export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  mail: varchar('mail', { length: 255 }).notNull().unique(),
  pseudo: varchar('pseudo', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['admin', 'user']).notNull().default('user'),
  displayName: varchar('display_name', { length: 50 }),
  avatarUrl: varchar('avatar_url', { length: 255 }).default('/avatars/default.png'),
  bio: text('bio'),
  isOnline: boolean('is_online').default(false),
})

// SQL table that stores users's friends content
export const friends = mysqlTable('friends', {
  id: int('id').autoincrement().primaryKey(),
  requesterId: int('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  addresseeId: int('addressee_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniquePair: unique().on(table.requesterId, table.addresseeId),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// SQL table that stores JWT refresh content
export const jwtRefreshToken = mysqlTable('jwt_refresh_token', {
  id: int('id').autoincrement().primaryKey(),
  owner_id: int('owner_id').notNull(),
  token_hash: varchar('token_hash', { length: 255 }).notNull(),
  expires_at: timestamp('expires_at').notNull(),
})

export type JwtRefreshToken = typeof jwtRefreshToken.$inferSelect
export type NewJwtRefreshToken = typeof jwtRefreshToken.$inferInsert

// SQL table that stores 2FA content
export const twoFA = mysqlTable('two_factor', {
  id: int('id').autoincrement().primaryKey(),
  owner_id: int('owner_id').notNull().unique(),
  secret: varchar('secret', { length: 255 }).notNull(),
  enabled: boolean('enabled').notNull().default(false),
})

export type TwoFA = typeof twoFA.$inferSelect
export type NewTwoFA = typeof twoFA.$inferInsert

