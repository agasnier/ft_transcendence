# users_service

## What it does

`users_service` handles accounts, sessions, profiles, friends and 2FA. It reads and writes the `users`, `jwt_refresh_token`, `two_factor` and `friends` tables. It is also the service that signs access tokens.

Nginx routes `/auth`, `/users`, `/friends` and `/avatars` to it. `api_service` calls `/users` on the Docker network. The process listens on `0.0.0.0:3000`.

Code lives in `src/modules/`. Each module owns one table, `metrics` just reads them.

## Stack

- **Node.js**: runs the server in the container
- **Fastify**: routing, JSON schema validation, auth hooks
- **Drizzle**: ORM and SQL migrations
- **Argon2**: password hashing (after a Vault Transit HMAC)
- **Vault Transit**: HMAC for passwords and refresh tokens, ES256 for JWTs
- **JWT**: short-lived access token in an `httpOnly` cookie
- **otplib**: TOTP for 2FA
- **prom-client**: Prometheus metrics on `GET /metrics`

## Stack in detail

### Node.js

The app is written in TypeScript. In dev (`make dev`) `tsx watch src/server.ts` runs the sources and restarts when a file changes. In prod (`make up`) a two-stage image compiles to `dist/` and starts `node dist/server.js` as user `node`. `app.ts` builds the Fastify app. `server.ts` runs migrations then listens.

### Fastify

Fastify maps URLs to handlers and rejects bodies that do not match the route schema. Plugins cover cookies, avatar uploads (5 MB) and static files under `/avatars/`. `userAuthHook` runs as `preHandler` on protected routes. It expects a valid access token with `twofa` not set to `pending`. Only `POST /auth/2fa/verify` accepts a pending token.

### Drizzle

Tables are defined in `src/db/schema.ts`. `npm run db:generate` writes SQL into `app/drizzle/` and does not touch MariaDB. Migrations run at startup. DB credentials come from `/vault/secrets/db_creds.json`. When Vault rotates them, `src/db/index.ts` opens a new pool.

### Argon2

`hashPassword` asks Vault for an HMAC-SHA256 of the password, then runs `argon2.hash` on that digest. Verify does the same HMAC then `argon2.verify`. A leaked dump is useless without the Transit key.

### Vault Transit

The service talks to sidecar `users_service_agent` (AppRole), not to Vault itself. The agent writes `db_creds.json` and proxies Transit on port `8100`. This service can ask Transit to sign and verify. `api_service` can only verify.

### JWT

The access token is a JWT (`header.payload.signature`) with `id`, `pseudo`, `role`, `twofa` and `exp`. We build `header.payload` in `src/modules/vault/jwt.ts`, Vault Transit signs it (`ES256`). It lasts 15 minutes in the `access_token` cookie (`httpOnly`, path `/`).

The refresh token is not a JWT. It is 32 random bytes in the `refresh_token` cookie (path `/auth`, 7 days). Only the HMAC is stored. `GET /auth/session` uses it to issue a new pair when the access token is dead.

### otplib

The `twofa` module uses it to create TOTP secrets and check codes.

### prom-client

The `metrics` module uses it. Prometheus scrapes `GET /metrics`.

## Modules

### users

Accounts and profiles. Table: `users`.

| Column | Type | Notes |
|---|---|---|
| `id` | `int` | primary key, auto-increment |
| `mail` | `varchar(255)` | unique |
| `pseudo` | `varchar(255)` | unique, can be used as login |
| `password` | `varchar(255)` | Vault HMAC then Argon2 |
| `role` | `enum('admin','moderator','user')` | default `user` |
| `display_name` | `varchar(50)` | optional |
| `avatar_url` | `varchar(255)` | `/avatars/<uuid>.png`, nullable |
| `bio` | `text` | max 500 characters |

`PUT /users/:id` and `DELETE /users/:id` work for the user themselves or an `admin`. Only an admin can change `role`. `GET /users` hides `mail` and `role` for a normal `user`.

| Command | What it does | How |
|---|---|---|
| `GET /users` | list users (mail and role only for admin and moderator) | logged in |
| `GET /users/batch?ids=` | resolve up to 100 ids to `{ id, pseudo }` | chat / frontend |
| `GET /users/:id` | get one account | logged in |
| `POST /users` | create an account (no cookies) | `api_service` |
| `PUT /users/:id` | update mail, pseudo, password or role | user menu or admin |
| `DELETE /users/:id` | delete an account | user menu or admin |
| `GET /users/profile` | own profile | user menu |
| `PATCH /users/profile` | update `displayName` and `bio` | user menu |
| `POST /users/profile/avatar` | upload jpeg, png or webp (max 5 MB) | user menu |
| `DELETE /users/profile/avatar` | delete the avatar | user menu |
| `GET /users/:id/profile` | public profile | chat info panel |

### auth

Sessions. Table: `jwt_refresh_token`. Access token lasts 15 minutes (`access_token` cookie, path `/`). Refresh token is 32 random bytes, 7 days, cookie `refresh_token` on `/auth` only.

A user has one refresh token at a time. Creating a new one deletes the old rows.

| Column | Type | Notes |
|---|---|---|
| `id` | `int` | primary key, auto-increment |
| `owner_id` | `int` | `users.id` |
| `token_hash` | `varchar(255)` | Vault HMAC of the raw token |
| `expires_at` | `timestamp` | 7 days after creation |

If 2FA is on, login does not open a full session. It sets a short access token with `twofa: 'pending'`, drops the refresh cookie and returns `{ requires2FA: true }`. `twofa` finishes the login.

| Command | What it does | How |
|---|---|---|
| `POST /auth/register` | create an account and set cookies | signup |
| `POST /auth/login` | log in with email or pseudo, can return `{ requires2FA: true }` | login |
| `GET /auth/session` | restore or refresh the session | page load |
| `POST /auth/logout` | clear cookies and delete the refresh token | logout |
| `POST /auth/password` | change password (current + new) | user menu |

### twofa

TOTP. Table: `two_factor`. One row per user.

| Column | Type | Notes |
|---|---|---|
| `id` | `int` | primary key, auto-increment |
| `owner_id` | `int` | unique, `users.id` |
| `secret` | `varchar(255)` | TOTP secret from `otplib` |
| `enabled` | `boolean` | `false` until the user confirms |

Setup returns `409` if 2FA is already on. `verify` is the only route that accepts a pending cookie. On success it opens a real session.

| Command | What it does | How |
|---|---|---|
| `POST /auth/2fa/setup` | create a TOTP secret and `otpauth://` URI | user menu |
| `POST /auth/2fa/enable` | set `enabled` to true (setup first) | user menu |
| `GET /auth/2fa/status` | `{ enabled }` | user menu |
| `POST /auth/2fa/verify` | check the code and open a session | 2FA form |
| `POST /auth/2fa/disable` | check the code and set `enabled` to false | user menu |

### friends

Friend list. Table: `friends`. Pair `(requester_id, addressee_id)` is unique. If B sends a request while A already asked B, the row is accepted.

| Column | Type | Notes |
|---|---|---|
| `id` | `int` | primary key, auto-increment |
| `requester_id` | `int` | who sent the request, FK `users.id` |
| `addressee_id` | `int` | who received it, FK `users.id` |
| `status` | `varchar(20)` | `pending` or `accepted` |
| `created_at` | `timestamp` | set on insert |

| Command | What it does | How |
|---|---|---|
| `POST /friends/:userId` | send a request (or accept if it already exists the other way) | friends panel |
| `PATCH /friends/:userId/accept` | accept a request | friends panel |
| `DELETE /friends/:userId/decline` | drop a pending request | friends panel |
| `GET /friends` | list friends (`?search=` on `displayName`) | friends panel |
| `DELETE /friends/:userId` | remove a friend | friends panel |
| `GET /friends/requests/incoming` | pending received | friends panel |
| `GET /friends/requests/outgoing` | pending sent | friends panel |

### metrics

Reads the other tables and exposes gauges plus request duration.

| Command | What it does | How |
|---|---|---|
| `GET /metrics` | Prometheus scrape | Prometheus |

## Commands

Scripts for this service. HTTP routes are in the modules.

| Command | What it does | How |
|---|---|---|
| `npm run dev` | server with hot reload | `app/` or `make dev` |
| `npm run build` | compile TypeScript to `dist/` | `app/` |
| `npm run db:generate` | write a SQL migration from `schema.ts` | `app/` |
| `npm run db:migrate` | apply pending SQL (also at startup) | `app/` |
