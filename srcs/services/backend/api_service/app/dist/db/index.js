import { readFileSync, watch } from 'node:fs';
import { basename, dirname } from 'node:path';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';
// getting database var from .env
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
const dbConfig = {
    host: requireEnv('DB_HOST'),
    port: Number(requireEnv('DB_PORT')),
    database: requireEnv('MARIADB_DATABASE'),
};
//getting database credentials from vault file
const dbCredsFile = '/vault/secrets/db_creds.json';
function readCreds() {
    const data = JSON.parse(readFileSync(dbCredsFile, 'utf8'));
    if (typeof data.username !== 'string' ||
        !data.username ||
        typeof data.password !== 'string' ||
        !data.password) {
        throw new Error(`Invalid or empty credentials in ${dbCredsFile}`);
    }
    return data;
}
let currentCreds = readCreds();
// cretaing the pool connection between the app and the database
function createConnection(creds) {
    const pool = mysql.createPool({
        host: dbConfig.host,
        port: dbConfig.port,
        user: creds.username,
        password: creds.password,
        database: dbConfig.database,
    });
    return { pool, db: drizzle(pool, { schema, mode: 'default' }) };
}
let currentConnection = createConnection(currentCreds);
// watch if the file changed
// if it was changed create new connection
watch(dirname(dbCredsFile), (_event, filename) => {
    if (filename !== basename(dbCredsFile))
        return;
    try {
        const creds = readCreds();
        // ignore false change
        if (creds.username === currentCreds.username && creds.password === currentCreds.password) {
            return;
        }
        currentCreds = creds;
        const previousPool = currentConnection.pool;
        currentConnection = createConnection(creds);
        // wait for closing the last connection
        setTimeout(() => {
            previousPool.end().catch(() => { });
        }, 5000);
    }
    catch {
    }
});
// Stable reference: forwards every access to the current drizzle instance,
// so the pool swap above stays invisible to the rest of the app.
export const db = new Proxy({}, {
    get(_target, prop, receiver) {
        return Reflect.get(currentConnection.db, prop, receiver);
    },
});
//# sourceMappingURL=index.js.map