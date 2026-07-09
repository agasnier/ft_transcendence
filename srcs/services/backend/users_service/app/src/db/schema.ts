import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  pseudo: varchar('pseudo', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
