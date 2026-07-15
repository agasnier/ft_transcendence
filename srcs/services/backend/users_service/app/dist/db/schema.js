import { mysqlTable, int, varchar, mysqlEnum, timestamp } from 'drizzle-orm/mysql-core';
// SQL table that stores users content
export const users = mysqlTable('users', {
    id: int('id').autoincrement().primaryKey(),
    mail: varchar('mail', { length: 255 }).notNull().unique(),
    pseudo: varchar('pseudo', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: mysqlEnum('role', ['admin', 'user']).notNull().default('user'),
});
// SQL table that stores JWT refresh content
export const jwtRefreshToken = mysqlTable('jwt_refresh_token', {
    id: int('id').autoincrement().primaryKey(),
    owner_id: int('owner_id').notNull(),
    token_hash: varchar('token_hash', { length: 255 }).notNull(),
    expires_at: timestamp('expires_at').notNull(),
});
//# sourceMappingURL=schema.js.map