import { type MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from './schema.js';
export declare const db: MySql2Database<typeof schema>;
