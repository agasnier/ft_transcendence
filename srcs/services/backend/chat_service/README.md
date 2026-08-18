# chat_service

## What it does

`chat_service` handles channels, messages, file attachments and live presence. It reads and writes the `channels`, `channel_members`, `discussion_pairs`, `messages` and `files` tables.

Nginx routes `/chat` to it (HTTP and WebSocket). It calls `users_service` on the Docker network for pseudos and roles. The process listens on `0.0.0.0:3000`.

Code lives in `src/modules/`. `channels` owns three tables. `messages` and `files` own one each. `websocket` and `metrics` have none.

## Stack

- **Node.js**: runs the server in the container
- **Fastify**: routing, JSON schema validation, auth hooks, uploads
- **Drizzle**: ORM and SQL migrations
- **Vault Transit**: dynamic DB credentials, JWT verify
- **JWT**: access token check on every route
- **WebSocket**: live messages, channel events and presence
- **prom-client**: Prometheus metrics on `GET /metrics`

## Stack in detail

### Node.js

The app is written in TypeScript. In dev (`make dev`) `tsx watch src/server.ts` runs the sources and restarts when a file changes. In prod (`make up`) a two-stage image compiles to `dist/` and starts `node dist/server.js` as user `node`. `app.ts` builds the Fastify app. `server.ts` runs migrations then listens.

### Fastify

Fastify maps URLs to handlers and rejects bodies that do not match the route schema. Plugins cover cookies, WebSocket, multipart files (10 MB) and static channel avatars under `/chat/avatars/`. `userAuthHook` runs as `preHandler` on every route. It checks the `access_token` cookie with Vault Transit.

### Drizzle

Tables are defined in `src/db/schema.ts`. `npm run db:generate` writes SQL into `app/drizzle/` and does not touch MariaDB. Migrations run at startup. DB credentials come from `/vault/secrets/db_creds.json`. When Vault rotates them, `src/db/index.ts` opens a new pool.

### Vault Transit

The service talks to sidecar `chat_service_agent` (AppRole), not to Vault itself. The agent writes `db_creds.json` and proxies Transit on port `8100`. This service can only verify JWTs. It cannot sign them.

### JWT

The access token is a JWT signed by `users_service`. We read `header.payload.signature` in `src/modules/vault/jwt.ts` and send it to `transit/verify/jwt`. On success we keep `id`, `pseudo` and `role` on the request.

### WebSocket

`GET /chat/ws` upgrades the connection after `userAuthHook`. Sockets are stored by user id. A ping every 20 seconds keeps nginx from closing the link. On connect the client gets `PRESENCE_SNAPSHOT`. After that it receives `USER_ONLINE`, `USER_OFFLINE`, `CHANNEL_CREATED`, `CHANNEL_UPDATED`, `CHANNEL_DELETED`, `MESSAGE_CREATED`, `MESSAGE_UPDATED` and `MESSAGE_DELETED`.

### prom-client

The `metrics` module uses it. Prometheus scrapes `GET /metrics`.

## Modules

### channels

Rooms. Three types: `channel` (write mode `moderators_only` by default), `group` (`everyone`) and `discussion` (two users). Creating a discussion twice for the same pair reuses the row. The other user is added on the first message.

Tables: `channels`, `channel_members`, `discussion_pairs`.

`channels`

| Column | Type | Notes |
|---|---|---|
| `id` | `int` | primary key, auto-increment |
| `name` | `varchar(255)` | unique, nullable |
| `type` | `varchar(32)` | `channel`, `group` or `discussion` |
| `description` | `varchar(255)` | optional |
| `avatar_url` | `varchar(255)` | `/chat/avatars/<uuid>`, nullable |
| `write_mode` | `enum('everyone','moderators_only')` | default `everyone` |
| `created_at` | `timestamp` | set on insert |

`channel_members`

| Column | Type | Notes |
|---|---|---|
| `id` | `int` | primary key, auto-increment |
| `channel_id` | `int` | FK `channels.id` |
| `user_id` | `int` | `users.id` |
| `role` | `enum('moderator','member')` | creator is `moderator` |
| `joined_at` | `timestamp` | set on insert |
| `last_read_message_id` | `int` | unread cursor, nullable |

`discussion_pairs`

| Column | Type | Notes |
|---|---|---|
| `id` | `int` | primary key, auto-increment |
| `channel_id` | `int` | FK `channels.id` |
| `user_min_id` | `int` | smaller of the two user ids |
| `user_max_id` | `int` | larger of the two user ids |

Pair `(user_min_id, user_max_id)` is unique. Rename, avatar, members, roles and write mode need a channel `moderator` or an `admin`.

| Command | What it does | How |
|---|---|---|
| `GET /chat/channels` | list my channels (unread flag included) | sidebar |
| `GET /chat/channels/all` | list every channel | search / join |
| `POST /chat/channels` | create a channel, group or discussion | create views |
| `PUT /chat/channels/:id` | rename or change description | info panel |
| `DELETE /chat/channels/:id` | delete a channel | info panel |
| `PATCH /chat/channels/:id/read` | mark as read | open a conversation |
| `GET /chat/channels/:id/members` | list members | info panel |
| `POST /chat/channels/:id/members` | add members | info panel |
| `DELETE /chat/channels/:id/members/:userId` | remove a member | info panel |
| `PUT /chat/channels/:id/members/:userId/role` | set `moderator` or `member` | info panel |
| `PUT /chat/channels/:id/write-mode` | set `everyone` or `moderators_only` | info panel |
| `POST /chat/channels/:id/avatar` | upload a channel avatar | info panel |
| `DELETE /chat/channels/:id/avatar` | delete the channel avatar | info panel |

### messages

Chat history. Table: `messages`. Pseudos come from `users_service` (`GET /users/batch`). System rows are written when members change.

Only the author can edit a user text message. File messages cannot be edited. Delete works for the author, a channel moderator or an admin. A moderator cannot delete an admin's message.

| Column | Type | Notes |
|---|---|---|
| `id` | `int` | primary key, auto-increment |
| `channel_id` | `int` | FK `channels.id` |
| `sender_id` | `int` | `users.id` |
| `content` | `varchar(2000)` | text or file name |
| `created_at` | `timestamp` | set on insert |
| `type` | `enum('user','system')` | default `user` |
| `file_id` | `int` | FK `files.id`, nullable |

| Command | What it does | How |
|---|---|---|
| `GET /chat/channels/:id/messages` | list messages | open a conversation |
| `POST /chat/channels/:id/messages` | send a text message | message input |
| `PUT /chat/channels/:id/messages/:messageId` | edit own text | chat window |
| `DELETE /chat/channels/:id/messages/:messageId` | delete a message | chat window |

### files

Attachments in a channel. Table: `files`. Allowed types: jpeg, png, webp, gif, pdf, txt, doc, docx. Max 10 MB. Upload also creates a message and broadcasts it. Download needs channel membership. Delete is the uploader or an admin.

| Column | Type | Notes |
|---|---|---|
| `id` | `int` | primary key, auto-increment |
| `channel_id` | `int` | FK `channels.id` |
| `uploader_id` | `int` | `users.id` |
| `original_name` | `varchar(255)` | name from the client |
| `stored_name` | `varchar(255)` | unique name on disk |
| `mime_type` | `varchar(100)` | checked on upload |
| `size` | `bigint` | bytes |
| `created_at` | `timestamp` | set on insert |

| Command | What it does | How |
|---|---|---|
| `POST /chat/files/:channelId` | upload a file and post a message | chat (backend ready) |
| `GET /chat/files/:id` | download a file | chat |
| `DELETE /chat/files/:id` | delete a file | uploader or admin |

### websocket

Presence is the set of open sockets. One user can have several tabs.

| Command | What it does | How |
|---|---|---|
| `GET /chat/ws` | open the live socket | frontend on login |

### metrics

Reads `channels` and `messages`, plus the live socket count.

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
