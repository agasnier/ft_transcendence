# vault

## What it does

`vault` holds secrets and signs crypto for the stack. It issues short-lived MariaDB users, HMACs passwords and API keys, and signs or verifies JWTs. Backend services never talk to it directly. Each one has a sidecar agent (`users_service_agent`, `chat_service_agent`, `api_service_agent`, `mysqld_exporter_agent`).

The server listens on `8200` on the Docker network `ft`. Storage is a bind mount (`srcs/data/vault` or `srcs/data/vault-dev`). Health is the file `/vault/approle/.ready` written when init is done.

`tools/entrypoint.sh` initializes and unseals Vault, enables Transit and the database engine, then writes AppRole `role_id` / `secret_id` for each folder in `policies/`.

## Stack

- **Vault**: secrets server, file storage, UI enabled
- **Transit**: HMAC and ES256 keys that never leave Vault
- **Database engine**: dynamic SQL users via `vault@'%'`
- **AppRole**: how each agent logs in
- **Vault Agent**: sidecar that templates creds and proxies Transit

## Stack in detail

### Vault

Image `hashicorp/vault`. Config is `config/vault.hcl` (listen `0.0.0.0:8200`, `storage file` at `/vault/file`, UI on). First boot writes `/vault/file/init.json` (unseal key and root token). Every boot unseals from that file then runs as root token to apply policies.

### Transit

The entrypoint enables `transit/` and creates three keys: `passwords` (HMAC before Argon2), `api-keys` (HMAC of public keys), `jwt` (`ecdsa-p256` for sign and verify).

### Database engine

Vault logs in to MariaDB as `vault` (password from secret `db_vault_password`), then `rotate-root` so only Vault knows it. Role TTL is 24h (max 72h). Each role gets `CREATE` on the schema (so Drizzle can create its tables) and DML/DDL only on the tables it owns. Agents read `database/creds/<service>` and write `db_creds.json`. The service watches that file and swaps its pool.

### AppRole

Each directory under `policies/` becomes a role: `database/roles/<service>`, policy `<service>-policy`, `auth/approle/role/<service>`. Credentials land in `/vault/approle/<service>/` on a tmpfs volume shared with the matching agent.

### Vault Agent

The agent uses AppRole, writes secrets from templates, and proxies Transit on port `8100` (`use_auto_auth_token`). The app calls `http://<service>_agent:8100/v1/transit/...`.

## Modules

### users_service

Policy: `database/creds/users_service`, `transit/hmac/passwords`, `transit/sign/jwt`, `transit/verify/jwt`. SQL: `CREATE` on the schema (Drizzle `CREATE TABLE`), DML/DDL on `users`, `friends`, `jwt_refresh_token`, `two_factor`, `__drizzle_migrations_users`.

### chat_service

Policy: `database/creds/chat_service`, `transit/verify/jwt`. SQL: `CREATE` on the schema, DML/DDL on `channels`, `channel_members`, `discussion_pairs`, `files`, `messages`, `__drizzle_migrations_chat`.

### api_service

Policy: `database/creds/api_service`, `transit/hmac/api-keys`, `transit/verify/jwt`. SQL: `CREATE` on the schema, DML/DDL on `api_keys`, `__drizzle_migrations_api`.

### mysqld_exporter

Policy: `database/creds/mysqld_exporter`. SQL: `PROCESS`, `REPLICATION CLIENT` on `*.*`, `SELECT` on `performance_schema.*` (no app table data). Agent template writes `/vault/secrets/.my.cnf`.

## Commands

In dev, Vault UI is on `http://localhost:8200`. Token is `root_token` in `srcs/data/vault-dev/init.json` (prod: `srcs/data/vault/init.json`).

| Command | What it does | How |
|---|---|---|
| `make dev` | start the stack, UI on `:8200` | repo root |
| open `http://localhost:8200` | Vault UI | browser, token from `init.json` |
