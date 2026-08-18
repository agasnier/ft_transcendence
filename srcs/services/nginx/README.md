# nginx

## What it does

`nginx` is the HTTPS front door. The browser only talks to it. It terminates TLS, runs the OWASP ModSecurity CRS, and proxies each path to the right container on the Docker network `ft`.

Published ports are `8080` (HTTP, 301 to HTTPS) and `8443` (TLS 1.2 / 1.3). The cert is self-signed (`/etc/nginx/conf/server.crt`). Max body size is 10 MB.

In prod, `/` goes to `frontend:80`. In dev (`Dockerfile.dev`), `/` goes to Vite on `frontend:5173` with WebSocket upgrade.

## Stack

- **Nginx**: reverse proxy, TLS, templates with `${PORT}` and `${SSL_PORT}`
- **ModSecurity CRS**: WAF, image `owasp/modsecurity-crs`
- **TLS**: self-signed cert, HTTP redirected to HTTPS

## Stack in detail

### Nginx

The config is copied into `/etc/nginx/templates/conf.d/default.conf.template`. The image substitutes env vars at start. Compose sets `ALLOWED_METHODS` to `GET HEAD POST OPTIONS PUT DELETE PATCH`. Locations that need WebSocket set `Upgrade` and `Connection`.

### ModSecurity CRS

The base image is `owasp/modsecurity-crs:nginx-alpine`. See **WAF** below.

### TLS

HTTP on `${PORT}` returns `301` to `https://$host:${SSL_PORT}`. SSL listen uses `server.crt` / `server.key` and `TLSv1.2` plus `TLSv1.3`.

## Modules

### locations

| Path | Upstream |
|---|---|
| `/` | `frontend` (`:80` prod, `:5173` dev) |
| `/auth` | `users_service:3000` |
| `/users` | `users_service:3000` |
| `/friends` | `users_service:3000` |
| `/avatars` | `users_service:3000` |
| `/api/` | `api_service:3000` |
| `/chat` | `chat_service:3000` (HTTP and `wss`) |
| `/drizzle/` | `drizzle-gateway:4983` |
| `/healthz` | `200 OK` |

## WAF

A WAF (Web Application Firewall) inspects HTTP before it reaches the app. Ours is **ModSecurity** with the **OWASP Core Rule Set** (CRS), baked into the nginx image.

CRS is a list of signatures for common attacks: SQL injection, XSS, path traversal, scanner user-agents, odd methods. A match returns **403** and the request never hits Fastify. Compose sets `ALLOWED_METHODS` so only `GET HEAD POST OPTIONS PUT DELETE PATCH` pass. `/healthz` has `modsecurity off` so Docker healthchecks are not blocked.

## Commands

Cert is self-signed. The browser will warn. `curl` needs `-k`.

A normal request should pass (200, 301 or 401). An attack string should be **403**. `-o /dev/null` drops the body. `-w '%{http_code}\n'` prints only the HTTP status.

```bash
# allowed
curl -k -o /dev/null -w '%{http_code}\n' https://localhost:8443/healthz
curl -k -o /dev/null -w '%{http_code}\n' https://localhost:8443/
curl -o /dev/null -w '%{http_code}\n' http://localhost:8080/

# blocked by CRS (expect 403)
curl -k -o /dev/null -w '%{http_code}\n' "https://localhost:8443/?id=1'+OR+'1'='1"
curl -k -o /dev/null -w '%{http_code}\n' "https://localhost:8443/?q=<script>alert(1)</script>"
curl -k -o /dev/null -w '%{http_code}\n' "https://localhost:8443/../../etc/passwd"
curl -k -o /dev/null -w '%{http_code}\n' -A 'sqlmap' https://localhost:8443/
curl -k -o /dev/null -w '%{http_code}\n' -X TRACE https://localhost:8443/

# /healthz bypasses the WAF (expect 200 even with a payload)
curl -k -o /dev/null -w '%{http_code}\n' "https://localhost:8443/healthz?id=1'+OR+'1'='1"
```
