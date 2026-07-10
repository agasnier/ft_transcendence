import { mysqlTable, int, varchar, mysqlEnum, timestamp } from 'drizzle-orm/mysql-core'

// SQL table that stores users content
export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  pseudo: varchar('pseudo', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['admin', 'user']).notNull().default('user'),
})

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
