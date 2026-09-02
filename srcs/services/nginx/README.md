# nginx

## What it does

`nginx` is the HTTPS front door. The browser only talks to it. It terminates TLS, runs the OWASP ModSecurity CRS, and proxies each path to the right container on the Docker network `ft`.

Published ports are `80` (HTTP, 301 to HTTPS) and `443` (TLS 1.2 / 1.3). Inside the container Nginx listens on `8080` / `8443` (unprivileged user). The cert is self-signed (`/etc/nginx/conf/server.crt`). Max body size is 10 MB.

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
| `/healthz` | `200 OK` |
| `drizzle.localhost` (`/`) | `drizzle-gateway:4983` |
| `grafana.localhost` (`/`) | `grafana:3000` |

## WAF

A WAF (Web Application Firewall) inspects HTTP before it reaches the app. Ours is **ModSecurity** with the **OWASP Core Rule Set** (CRS), baked into the nginx image.

CRS is a list of signatures for common attacks: SQL injection, XSS, path traversal, scanner user-agents, odd methods. A match returns **403** and the request never hits Fastify. Compose sets `ALLOWED_METHODS` so only `GET HEAD POST OPTIONS PUT DELETE PATCH` pass. `/healthz` has `modsecurity off` so Docker healthchecks are not blocked.

### Logs

ModSecurity writes an audit JSON line to the nginx container stdout (`MODSEC_AUDIT_LOG=/dev/stdout`). The engine is `RelevantOnly`, so you only see 4xx / 5xx (the 403s). Access logs are mixed in the same stream.

```bash
# which CRS rules matched
docker compose -f srcs/docker-compose.yml logs nginx | grep ruleId

# follow while you send an attack curl
docker compose -f srcs/docker-compose.yml logs -f nginx | grep --line-buffered ruleId
```

A block looks like `"ruleId":"941100"` (XSS) or `"ruleId":"942100"` (SQLi), then `"ruleId":"949110"` (`Inbound Anomaly Score Exceeded`) when the score hits the threshold.

### Tuning

We do not write CRS rules. The image reads environment variables at start and writes them into `crs-setup.conf`. Change them on the `nginx` service in `srcs/docker-compose.yml`, then recreate the container (a plain restart is not enough):

```bash
docker compose -f srcs/docker-compose.yml up -d --force-recreate nginx
```

CRS does not block on the first regex. Each matching rule adds points (a critical SQLi/XSS rule is 5). If the inbound total reaches the threshold, Nginx returns 403.

#### Engine (`MODSEC_RULE_ENGINE`)

| Value | Meaning |
|---|---|
| `off` | WAF disabled. Nothing is inspected. |
| `DetectionOnly` | Same rules, only logs. No 403. Use this to find false positives. |
| `on` | Rules run and 403 when the score is too high. |

**We use `on`.**

#### Paranoia (`BLOCKING_PARANOIA`)

Which CRS rules count toward the block score.

| Level | Meaning |
|---|---|
| `1` | Obvious SQLi, XSS, scanners. Few false positives. |
| `2` | Extra rules for camouflaged attacks. Chat text and bios can 403. |
| `3` | Very strict. The app often breaks. |
| `4` | Maximum. Unusable without a lot of exclusions. |

**We use `1`.**

`DETECTION_PARANOIA` can sit above blocking: those extra rules log but do not 403. We leave it unset (same as blocking).

#### Inbound threshold (`ANOMALY_INBOUND`)

Score on the **request** that triggers 403. One critical rule is already 5.

| Value | Meaning |
|---|---|
| `3` | Stricter. Warnings alone can be enough to block. |
| `5` | One clear attack is enough. |
| `10` | Needs about two critical rules. More permissive, fewer false positives. |

**We use `5`.**

#### Outbound threshold (`ANOMALY_OUTBOUND`)

Same idea on the **response** (SQL error pages or stack traces leaking out of Fastify).

| Value | Meaning |
|---|---|
| `4` | Default. One leak-looking response is enough. |
| higher | More permissive on what Fastify may return. |

**We use `4`.**

#### Allowed methods (`ALLOWED_METHODS`)

Any method not in the list is a CRS hit. The image default is `GET HEAD POST OPTIONS` only.

| Value | Meaning |
|---|---|
| image default | `PUT` / `PATCH` / `DELETE` would 403 (user edits, 2FA, public API). |
| `GET HEAD POST OPTIONS PUT DELETE PATCH` | REST verbs the app actually uses. Do not add `TRACE`. |

**We use `GET HEAD POST OPTIONS PUT DELETE PATCH`.**

#### Body size (`MODSEC_REQ_BODY_LIMIT`)

Max body the WAF buffers. Over the limit: reject.

| Value | Meaning |
|---|---|
| `13107200` (~12.5 MB) | Image default. Nginx `client_max_body_size` is 10 MB, so they line up. |

**We use the image default (`13107200`).**

#### Per-location off switch

`modsecurity off` in `nginx.conf` skips CRS on that location.

| Location | Meaning |
|---|---|
| `/healthz` | Docker healthcheck must not die on a query string. |
| `grafana.localhost` | Internal tool. Grafana requests look odd to CRS. |
| `drizzle.localhost` | Same, SQL studio. |

**We turn it off only there.** Do not turn it off on `/auth` or `/chat`.

#### Exclusions

If a real chat message or profile field returns 403, do not raise paranoia and do not turn the engine off. Either raise `ANOMALY_INBOUND` a little, or exclude **one rule** on **one field**. Mount a file as `/etc/modsecurity.d/owasp-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf`:

```
SecRule REQUEST_URI "@beginsWith /chat/" \
  "id:1001,phase:1,pass,nolog,ctl:ruleRemoveTargetById=941100;ARGS:json.content"
```

`ruleRemoveTargetById` keeps the rule everywhere else (login still blocked). `ruleRemoveById` kills the whole rule — last resort.

**We have no exclusions.** At paranoia 1, legitimate traffic does not hit the threshold.

## Commands

Cert is self-signed. The browser will warn. `curl` needs `-k`.

A normal request should pass (200, 301 or 401). An attack string should be **403**. `-o /dev/null` drops the body. `-w '%{http_code}\n'` prints only the HTTP status.

```bash
# allowed
curl -k -o /dev/null -w '%{http_code}\n' https://localhost/healthz
curl -k -o /dev/null -w '%{http_code}\n' https://localhost/
curl -o /dev/null -w '%{http_code}\n' http://localhost/

# blocked by CRS (expect 403)
curl -k -o /dev/null -w '%{http_code}\n' "https://localhost/?id=1'+OR+'1'='1"
curl -k -o /dev/null -w '%{http_code}\n' "https://localhost/?q=<script>alert(1)</script>"
curl -k -o /dev/null -w '%{http_code}\n' "https://localhost/../../etc/passwd"
curl -k -o /dev/null -w '%{http_code}\n' -A 'sqlmap' https://localhost/
curl -k -o /dev/null -w '%{http_code}\n' -X TRACE https://localhost/

# /healthz bypasses the WAF (expect 200 even with a payload)
curl -k -o /dev/null -w '%{http_code}\n' "https://localhost/healthz?id=1'+OR+'1'='1"
```
