import type { FastifyInstance } from 'fastify'
import client from 'prom-client'
import { and, count, eq, gt, lte } from 'drizzle-orm'
import { boolean, int, mysqlTable } from 'drizzle-orm/mysql-core'
import { db } from '../../db/index.js'
import { apiKeys } from '../../db/schema.js'

const users = mysqlTable('users', {
  id: int('id').primaryKey(),
  isOnline: boolean('is_online').default(false),
})

client.register.clear()

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 3, 5],
})

const apiKeysTotal = new client.Gauge({
  name: 'api_keys_total',
  help: 'Total number of API keys by status (active: valid and user online, inactive: valid and user offline, expired: expired key)',
  labelNames: ['status'],
})

const apiKeysActiveTotal = new client.Gauge({
  name: 'api_keys_active_total',
  help: 'Total number of valid active (user online) API keys',
})

const apiKeysInactiveTotal = new client.Gauge({
  name: 'api_keys_inactive_total',
  help: 'Total number of valid inactive (user offline) API keys',
})

export async function metricsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', (request, reply, done) => {
    (reply as any).startTime = process.hrtime()
    done()
  })

  app.addHook('onResponse', (request, reply, done) => {
    if ((reply as any).startTime) {
      const diff = process.hrtime((reply as any).startTime)
      const durationInSeconds = diff[0] + diff[1] / 1e9
      httpRequestDuration
        .labels(
          request.method,
          request.routeOptions?.url || request.url,
          reply.statusCode.toString(),
        )
        .observe(durationInSeconds)
    }
    done()
  })

  app.get('/metrics', async (_request, reply) => {
    try {
      const now = new Date()

      // Clés valides & actives (utilisateur connecté)
      const activeKeysRes = await db
        .select({ value: count() })
        .from(apiKeys)
        .innerJoin(users, eq(apiKeys.owner_id, users.id))
        .where(and(gt(apiKeys.expires_at, now), eq(users.isOnline, true)))
      const activeCount = activeKeysRes[0]?.value ?? 0

      // Clés valides & inactives (utilisateur hors-ligne)
      const inactiveKeysRes = await db
        .select({ value: count() })
        .from(apiKeys)
        .innerJoin(users, eq(apiKeys.owner_id, users.id))
        .where(and(gt(apiKeys.expires_at, now), eq(users.isOnline, false)))
      const inactiveCount = inactiveKeysRes[0]?.value ?? 0

      // Clés expirées
      const expiredKeysRes = await db
        .select({ value: count() })
        .from(apiKeys)
        .where(lte(apiKeys.expires_at, now))
      const expiredCount = expiredKeysRes[0]?.value ?? 0

      apiKeysTotal.labels('active').set(activeCount)
      apiKeysTotal.labels('inactive').set(inactiveCount)
      apiKeysTotal.labels('expired').set(expiredCount)

      apiKeysActiveTotal.set(activeCount)
      apiKeysInactiveTotal.set(inactiveCount)
    } catch {
      // ignore database errors during metrics collection
    }

    reply.header('Content-Type', client.register.contentType)
    return await client.register.metrics()
  })
}

