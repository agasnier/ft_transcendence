# Backend

## Microservices - 2pts

The backend is not a single app, it is split into several **services**, one **container per service**. Each service owns one responsibility, runs on its own, and talks to the others over HTTP via docker network.

Every service is built the same way, so this README describes one service; the others follow the same recipe.

## Stack

Each service is a Fastify server written in TypeScript, running on Node.js.

- **Node.js**: a JavaScript runtime that runs JS outside the browser, here inside the Docker container. It's what executes the server.
- **Fastify**: the web framework. It handles incoming HTTP requests, routing, and sending back responses (usually JSON).
- **TypeScript**: a superset of JavaScript that adds static types, checked at build time to catch mistakes before the code runs.
- **tsx**: runs TypeScript directly with hot-reload in development, so we don't have to compile by hand while coding.

### Why Node

JavaScript needs an engine to execute it, and a browser is only one place that provides one. 
Node.js packages that same engine so JavaScript can run inside our Docker container, with no browser involved.

### Why Fastify

Node.js alone gives you a very low-level `http` module: you'd have to parse the URL, match routes, parse the request body, and validate everything by hand. Fastify does that for us:

- **Routing**: maps an HTTP method + URL (ex: `GET /api/hello`) to the function that handles it, instead of writing `if` chains ourselves.
- **Validation**: each route can declare a **schema** for its request/response. Fastify checks incoming data against it automatically, and rejects what doesn't match.
- **Plugins**: features (database, auth, ...) are added as plugins registered on the app, which keeps things modular, same idea as our modules.
- **Performance**: it's built to be fast and lightweight, well suited to run in a small microservice container.

### Dependencies vs devDependencies

Like the frontend, **package.json** splits packages into two lists:

- **dependencies**: code the service needs at runtime (**fastify**). (prod)
- **devDependencies**: tools only needed while developing/building. (dev)

### Docker multi-stage
Because we have **dependencies** and **devDependancies** the **Dockerfile** builds the image in two stages: (see: Dockerfile)

1. **builder**: installs the npm dependencies, copies the source, and runs **devTools**
2. **runner**: copies only **/app/dist** from the **builder** stage and serves it as static files on port 80. Node, npm, and all the dev dependencies stay out of the final image, which keeps it small.

## How a service is organized

Inside a service, the code lives in `app/src` and is split into **modules**. A module is one feature (ex: **hello** for helloworld), and it's cut into small files with clear roles:

- **route**: declares the URLs and which function answers them. (get the recipe)
- **controller**: reads the request and sends the reply. (the recipe)
- **service**: the actual logic (the part that does the work). (the ingredients)
- **schema**: describes the shape of the request/response so Fastify can validate it. (norm)

Two files tie everything together:

- **app.ts** — builds the Fastify app and registers every module (each under the **/api** prefix). It builds the app but does **not** start it.
- **server.ts** — takes that app and actually starts listening on the configured host/port.
- **config/env.ts** — reads settings from environment variables (host, port, dev vs prod) with sensible fallbacks.

Adding a feature = adding a new module and registering it in **app.ts**.

## Working with database and ORM

Please read the readme from database directory

## Adding a new service

The fastest way to create a new microservice (ex: **new_service**) is to copy an existing one rather than creating it from scratch with `npm init`. Instead of reinstalling every dependency by hand and risking a forgotten config.

1. **Copy the folder**: `./existing_service` → `../new_service`, keeping the same layout (`Dockerfile`, `Dockerfile.dev`, `app/package.json`, `app/tsconfig.json`, `app/src/...`).
2. **Rename** the service in `app/package.json` (`name`), and replace module in `src/` with whatever the new service actually needs.
3. **Register it in `docker-compose.yml`**: add a new service block. (copy and adapt from existing services)
4. **Register it in `docker-compose.dev.yml`** too.
5. **Route it through nginx**: add a new `location` block in both `nginx.conf` and `nginx.dev.conf`, with its own URL prefix (ex: `location /new_service/`) pointing to `proxy_pass http://new_service:3000;`.

## Working locally

From a service's `app/` folder:

```bash
npm install       # install dependencies
npm run dev       # start the server with hot reload (tsx watch)
npm run build     # compile TypeScript to JavaScript into dist/
npm start         # run the compiled app (node dist/server.js)
```
