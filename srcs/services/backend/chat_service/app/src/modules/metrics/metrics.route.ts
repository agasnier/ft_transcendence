import type { FastifyInstance } from 'fastify'
import client from 'prom-client'

client.register.clear()
client.collectDefaultMetrics()

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 3, 5],
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
    reply.header('Content-Type', client.register.contentType)
    return await client.register.metrics()
  })
}
