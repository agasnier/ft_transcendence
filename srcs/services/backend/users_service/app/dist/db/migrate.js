import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db } from './index.js';
export async function runMigrations() {
    await migrate(db, {
        migrationsFolder: './drizzle',
        migrationsTable: '__drizzle_migrations_users',
    });
}
//# sourceMappingURL=migrate.js.map