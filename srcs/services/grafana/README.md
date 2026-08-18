# grafana

## What it does

This folder provisions **Grafana**. Next to it, Compose runs **Prometheus** (`srcs/prometheus.yml`) and **mysqld-exporter**. Prometheus scrapes metrics every 15s. Grafana reads Prometheus and shows dashboards plus alert rules.

Grafana is on `http://localhost:3000`. Prometheus is on `http://localhost:9090`. Login uses `GF_SECURITY_ADMIN_USER` and `GF_SECURITY_ADMIN_PASSWORD` from `srcs/env/.env`.

Dashboards and alerts are files under `provisioning/`. They load on start.

## Stack

- **Prometheus**: time-series store, scrape config in `srcs/prometheus.yml`
- **mysqld-exporter**: MariaDB metrics, creds from Vault (`.my.cnf`)
- **Grafana**: dashboards and alerts, datasource Prometheus
- **prom-client**: `/metrics` on each Fastify service

## Stack in detail

### Prometheus

Config is mounted at `/etc/prometheus/prometheus.yml`. Jobs: `prometheus`, `mariadb` (`mysqld-exporter:9104`), `users_service`, `api_service`, `chat_service` (port `3000`). Data sits on `srcs/data/prometheus` (or `prometheus-dev`).

### mysqld-exporter

Image `prom/mysqld-exporter`. It reads `/vault/secrets/.my.cnf` written by `mysqld_exporter_agent`. That user only has `PROCESS`, `REPLICATION CLIENT` and `SELECT`.

### Grafana

Provisioning:

- `provisioning/datasources/prometheus.yml` points at `http://prometheus:9090`
- `provisioning/dashboards/` is the dashboard provider
- `provisioning/alerting/alert-rules.yaml` is the alert rules

Data sits on `srcs/data/grafana` (or `grafana-dev`).

### prom-client

Each backend service exposes `GET /metrics`. Prometheus scrapes that path. See the `metrics` module in each service README.

## Modules

### dashboards

| File | Title |
|---|---|
| `Section_Données_HTTP.json` | HTTP status, RPS, errors, latency |
| `Section_Activite_chat.json` | channels, message volume |
| `Section_communauté_Utilisateur.json` | users, friends, staff roles |
| `Section_Securite_Authentification.json` | 2FA adoption |
| `Section_Base_donnes.json` | MariaDB connections, QPS, slow queries |

### alerts

Folder `alerte` in Grafana. Receiver is `empty` (rules fire in the UI only).

| Rule | Fires when |
|---|---|
| `service` | a scrape target is down (`up == 0`) for 1 min |
| `Latence anormale des requêtes` | HTTP p95 above 1s |
| `mysql_global_status_threads_connected` | more than 50 SQL connections |
| `Requêtes SQL lentes détectées` | `rate(slow_queries) > 0` |

## Commands

```bash
curl -s http://localhost:9090/-/ready
curl -s http://localhost:9090/api/v1/targets | head
curl -s http://localhost:3000/api/health
```

`/metrics` is not published on the host. In Prometheus open **Status → Targets**. Every job should be `UP`.

| Command | What it does | How |
|---|---|---|
| open `http://localhost:3000` | Grafana UI | browser, env admin user |
| open `http://localhost:9090` | Prometheus UI | browser |
| open `http://localhost:9090/targets` | scrape status | browser |
| `curl -s http://localhost:9090/-/ready` | Prometheus health | terminal |
