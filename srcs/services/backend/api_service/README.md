# api_service

## What it does

`api_service` is the public REST API. Third parties send an `x-api-key` header and call `/api/users`. Logged-in users create, read, renew and revoke their own key on `/api/api_keys`. It owns the `api_keys` table.

Nginx routes `/api/` to it. User CRUD is forwarded to `users_service` on the Docker network. Docs are on `/api/docs`. The process listens on `0.0.0.0:3000`.

Code lives in `src/modules/`. `api_keys` owns the table. `users` and `metrics` have none.

## Stack

- **Node.js**: runs the server in the container
- **Fastify**: routing, JSON schema validation, auth hooks
- **Drizzle**: ORM and SQL migrations
- **Vault Transit**: HMAC for API keys, JWT verify, dynamic DB credentials
- **JWT**: cookie check on `/api/api_keys`
- **Swagger / Scalar**: OpenAPI spec and interactive docs
- **Rate limit**: 5 requests per minute per key on `/api/users`
- **prom-client**: Prometheus metrics on `GET /metrics`

## Stack in detail

### Node.js

The app is written in TypeScript. In dev (`make dev`) `tsx watch src/server.ts` runs the sources and restarts when a file changes. In prod (`make up`) a two-stage image compiles to `dist/` and starts `node dist/server.js` as user `node`. `app.ts` builds the Fastify app. `server.ts` runs migrations then listens.

### Fastify

Fastify maps URLs to handlers and rejects bodies that do not match the route schema. Plugins cover cookies, Swagger, Scalar and rate limit. `userAuthHook` checks the `access_token` cookie on `/api/api_keys`. `apiKeyAuthHook` checks `x-api-key` on `/api/users`.

### Drizzle

The `api_keys` table is defined in `src/db/schema.ts`. `npm run db:generate` writes SQL into `app/drizzle/` and does not touch MariaDB. Migrations run at startup. DB credentials come from `/vault/secrets/db_creds.json`. When Vault rotates them, `src/db/index.ts` opens a new pool.

### Vault Transit

The service talks to sidecar `api_service_agent` (AppRole), not to Vault itself. The agent writes `db_creds.json` and proxies Transit on port `8100`. HMAC uses `transit/hmac/api-keys`. JWT verify uses `transit/verify/jwt`. This service cannot sign tokens.

### JWT

`/api/api_keys` needs a logged-in browser. We read `header.payload.signature` from the `access_token` cookie and send it to `transit/verify/jwt`. On success we keep `id`, `pseudo` and `role` on the request.

### Swagger / Scalar

`@fastify/swagger` builds the OpenAPI spec from the route schemas. `@scalar/fastify-api-reference` serves it at `/api/docs`. See **Docs** below.

### Rate limit

`@fastify/rate-limit` sits on `/api/users` only. Max 5 requests per minute. The key is the owner of the API key, not the IP.

### prom-client

The `metrics` module uses it. Prometheus scrapes `GET /metrics`.

## Modules

### api_keys

One key per user. The raw key is 32 random bytes, shown once at create or renew. Only the Vault HMAC is stored. Validity is 15 days.

Table: `api_keys`.

| Column | Type | Notes |
|---|---|---|
| `id` | `int` | primary key, auto-increment |
| `owner_id` | `int` | `users.id` |
| `api_key_hash` | `varchar(255)` | Vault HMAC of the raw key |
| `expires_at` | `timestamp` | 15 days after create or renew |

| Command | What it does | How |
|---|---|---|
| `GET /api/api_keys` | `{ hasKey }` plus expiry if a key exists | user menu, cookie |
| `POST /api/api_keys` | create a key, returns the raw value once | user menu, cookie |
| `PUT /api/api_keys` | renew the key, returns the new raw value once | user menu, cookie |
| `DELETE /api/api_keys` | revoke the key | user menu, cookie |

### users

Forwards CRUD to `users_service` (`GET/POST /users`, `GET/PUT/DELETE /users/:id`). Every call needs a valid `x-api-key`.

| Command | What it does | How |
|---|---|---|
| `GET /api/users` | list users | `x-api-key` |
| `GET /api/users/:id` | get one user | `x-api-key` |
| `POST /api/users` | create a user | `x-api-key` |
| `PUT /api/users/:id` | update a user | `x-api-key` |
| `DELETE /api/users/:id` | delete a user | `x-api-key` |
| `GET /api/docs` | interactive OpenAPI page | browser |

### metrics

Counts API keys (active, inactive, expired) and request duration.

| Command | What it does | How |
|---|---|---|
| `GET /metrics` | Prometheus scrape | Prometheus |

## Docs

With the stack up, open:

`https://localhost/api/docs`

The cert is self-signed. Accept the browser warning.

Scalar lists the `/api/users` routes (GET, POST, PUT, DELETE). `/api/api_keys` is hidden (`hide: true` in the schema). Create the key in the user menu or with the cookie curls below.

To call a route from the page:

1. Create a key in the app (user menu).
2. In Scalar, open Auth / `ApiKeyAuth`.
3. Paste the raw key. It is sent as `x-api-key`.
4. Open a route, fill the body or `:id`, click Send.

Rate limit is 5 requests per minute per key. A 429 means wait.

## curl

Host is `https://localhost`. `-k` skips the self-signed cert check. Replace `$KEY` with the raw key from the user menu.

```bash
curl -k https://localhost/api/users \
  -H "x-api-key: $KEY"

curl -k https://localhost/api/users/1 \
  -H "x-api-key: $KEY"

curl -k -X POST https://localhost/api/users \
  -H "x-api-key: $KEY" \
  -H 'Content-Type: application/json' \
  -d '{"mail":"new@mail.com","pseudo":"newuser","password":"atleast8"}'

curl -k -X PUT https://localhost/api/users/1 \
  -H "x-api-key: $KEY" \
  -H 'Content-Type: application/json' \
  -d '{"pseudo":"renamed"}'

curl -k -X DELETE https://localhost/api/users/1 \
  -H "x-api-key: $KEY"
```

`POST` and `DELETE` need an admin key. `PUT` works for the owner or an admin.

## Commands

Scripts for this service. HTTP routes are in the modules.

| Command | What it does | How |
|---|---|---|
| `npm run dev` | server with hot reload | `app/` or `make dev` |
| `npm run build` | compile TypeScript to `dist/` | `app/` |
| `npm run db:generate` | write a SQL migration from `schema.ts` | `app/` |
| `npm run db:migrate` | apply pending SQL (also at startup) | `app/` |
