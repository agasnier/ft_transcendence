# Database

## Persistent data

Database data is persisted on the host via a bind mount to `srcs/data` (`db_data` volume in `docker-compose.yml`). This keeps the data across `docker compose down`/`up` cycles, independent of the container's lifecycle.

## Creating tables via ORM

This service only runs a plain MariaDB image. There is nothing to code here: table creation, migrations, and queries are handled by ORMs directly in the backend services, not in this folder.

An ORM (Object-Relational Mapper) is a library that lets code interact with the database through objects and method calls instead of raw SQL. Progamation langage, not SQL.

### Where it lives (example: auth_service)

Inside a service's `app/src/db/` folder:

- **schema.ts** — the source of truth for the tables, written as TypeScript. Example: the `users` table (`pseudo`, `password`) in `auth_service`. Drizzle reads this file to know what the database *should* look like.
- **index.ts** — opens the connection pool to MariaDB (host, port, user, password, database, all read from environment variables) and exports the `db` object used everywhere else to query.
- **migrate.ts** — applies the generated SQL migrations to the real database. Called once, at service startup (`server.ts`), before the app starts listening.

### Two steps: Generate and migrate

- **generate** (`npm run db:generate`) — reads `schema.ts` and writes the corresponding SQL into `app/drizzle/`. It only produces files on disk, it never touches the database.
- **migrate** — takes that SQL and actually runs it against the real database (`CREATE TABLE`, `ALTER TABLE`, ...). 


### The workflow

1. Edit `schema.ts` (add a column, a table, etc.).
2. From the service's `app/` folder, run:
   ```bash
   npm run db:generate
   ```
   This does **not** touch the database. It compares `schema.ts` to the previous snapshot and writes the SQL diff into `app/drizzle/` (a `.sql` file + metadata). Commit this folder to git, it's the versioned history of the schema, same idea as regular migrations.
3. (Re)start the service (`make dev` / `make up`). `runMigrations()` reads `app/drizzle/` and applies whatever hasn't been applied yet to the real database.

### Inspecting the data (dev only)

`drizzle-kit studio` opens a web UI to browse/edit the rows directly. In dev, MariaDB's port `3306` is exposed to `localhost` (see `docker-compose.dev.yml`) specifically so this can connect from your machine:

```bash
make dev                 # in one terminal, keeps the stack (incl. database) running
npm run db:studio        # in the service's app/ folder, in another terminal
```

Then open `https://local.drizzle.studio` in a browser.
