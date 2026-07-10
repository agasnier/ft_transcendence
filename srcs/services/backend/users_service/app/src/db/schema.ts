import { mysqlTable, int, varchar, mysqlEnum } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  pseudo: varchar('pseudo', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['admin', 'user']).notNull().default('user'),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
