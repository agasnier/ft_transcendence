import { mysqlTable, mysqlSchema, AnyMySqlColumn, unique, int, varchar } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	pseudo: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
},
(table) => [
	unique("users_pseudo_unique").on(table.pseudo),
]);
