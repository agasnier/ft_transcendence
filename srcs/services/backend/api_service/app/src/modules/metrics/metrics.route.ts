import type { FastifyInstance } from 'fastify'
import client from 'prom-client'
import { count, gt } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { apiKeys } from '../../db/schema.js'

client.register.clear()
client.collectDefaultMetrics()

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 3, 5],
})

const apiKeysActiveTotal = new client.Gauge({
  name: 'api_keys_active_total',
  help: 'Total number of active non-expired API keys',
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
      const activeKeysRes = await db
        .select({ value: count() })
        .from(apiKeys)
        .where(gt(apiKeys.expires_at, new Date()))
      apiKeysActiveTotal.set(activeKeysRes[0]?.value ?? 0)
    } catch {
      // ignore database errors during metrics collection
    }

    reply.header('Content-Type', client.register.contentType)
    return await client.register.metrics()
  })
}

