# database

## What it does

`database` is a MariaDB server. It stores the data of `users_service`, `chat_service` and `api_service`. It listens on port `3306` on the Docker network `ft`.

The root password comes from the Docker secret `db_root_password`. The database name comes from `MARIADB_DATABASE` in `srcs/env/.env`. Data sits on a bind mount (`srcs/data/mariadb` in prod, `srcs/data/mariadb-dev` in dev).

At first boot `tools/entrypoint.sh` creates the SQL user `vault@'%'`. Vault logs in as that user and issues short-lived credentials for each backend service.

## Stack

- **MariaDB**: SQL server, image `mariadb`
- **Docker secrets**: root password and Vault SQL password
- **Bind mount**: `/var/lib/mysql` on the host
- **entrypoint.sh**: waits for MariaDB, then creates the `vault` user
- **healthcheck**: `healthcheck.sh --connect --innodb_initialized`

## Stack in detail

### MariaDB

The process is `mariadbd`. Tables are created by the backend services at startup (Drizzle migrations). This folder has no schema of its own.

### Docker secrets

`MARIADB_ROOT_PASSWORD_FILE` points to `/run/secrets/db_root_password`. The entrypoint also reads `/run/secrets/db_vault_password` to set the password of `vault@'%'`. Sample files live in `srcs/env/secrets.sample/`.

### Bind mount

Compose maps `db_data` to `./data/mariadb` (or `./data/mariadb-dev`). A `docker compose down` keeps the files. `make fclean` can delete them (needs `sudo`, the files are owned by root in the container).

### entrypoint.sh

The script waits until root can run `SELECT 1`. Then it `CREATE USER` `vault@'%'` and grants `CREATE USER`, `PROCESS`, `REPLICATION CLIENT`, `SELECT` on `*.*` plus `ALL PRIVILEGES` on `${MARIADB_DATABASE}` `WITH GRANT OPTION`. The grant block runs in the background so `mariadbd` can start. Then it `exec`s the official entrypoint.

### healthcheck

Compose uses `healthcheck.sh --connect --innodb_initialized` every 2s. Vault and the backend services wait for `service_healthy`.

## Modules

### users_service tables

Created by `users_service` migrations.

| Table | Role |
|---|---|
| `users` | accounts |
| `jwt_refresh_token` | refresh sessions |
| `two_factor` | TOTP secrets |
| `friends` | friend graph |

### chat_service tables

Created by `chat_service` migrations.

| Table | Role |
|---|---|
| `channels` | rooms |
| `channel_members` | membership and unread cursor |
| `discussion_pairs` | unique 1-to-1 pair |
| `messages` | chat history |
| `files` | attachments |

### api_service tables

Created by `api_service` migrations.

| Table | Role |
|---|---|
| `api_keys` | hashed public API keys |

## SQL

Open Drizzle Gateway at `https://drizzle.localhost`. Paste this URL. Password is the content of `srcs/env/secrets/db_root_password.txt`. Database name is `MARIADB_DATABASE` in `srcs/env/.env` (`db_name` by default).

```text
mysql://root:<password>@database:3306/db_name
```

From the host (dev, port `3306` published):

```text
mysql://root:<password>@127.0.0.1:3306/db_name
```

```sql
SHOW TABLES;

SELECT id, mail, pseudo, role FROM users;

SELECT * FROM friends;

SELECT id, name, type, write_mode FROM channels;

SELECT id, channel_id, sender_id, content, type FROM messages;

SELECT owner_id, expires_at FROM api_keys;
```

## Commands

In dev, MariaDB is published on `localhost:3306` so Drizzle Studio can connect from the host.

| Command | What it does | How |
|---|---|---|
| `make dev` | start the stack, DB on `localhost:3306` | repo root |
| `npm run db:studio` | browse tables in the browser | a service `app/` folder, stack already up |
| `make fclean` | stop and optionally wipe `srcs/data/mariadb*` | repo root, `sudo` if you confirm |
