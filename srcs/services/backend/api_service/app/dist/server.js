import { buildApp } from './app.js';
import { env } from './config/env.js';
import { runMigrations } from './db/migrate.js';
// construct the app
const app = buildApp();
const start = async () => {
    try {
        // create the "api_keys" SQL table via Drizzle
        await runMigrations();
        await app.listen({ port: env.port, host: env.host });
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map