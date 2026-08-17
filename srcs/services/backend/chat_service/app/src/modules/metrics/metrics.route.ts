import type { FastifyInstance } from 'fastify'
import client from 'prom-client'
import { count, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { channels, messages } from '../../db/schema.js'

client.register.clear()
client.collectDefaultMetrics()

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 3, 5],
})

const chatMessagesSentTotal = new client.Gauge({
  name: 'chat_messages_sent_total',
  help: 'Total number of chat messages sent by type or channel type',
  labelNames: ['type'],
})

const chatChannelsTotal = new client.Gauge({
  name: 'chat_channels_total',
  help: 'Total number of chat channels by type',
  labelNames: ['type'],
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
      const publicMsgRes = await db
        .select({ value: count() })
        .from(messages)
        .innerJoin(channels, eq(messages.channelId, channels.id))
        .where(eq(channels.type, 'public'))
      chatMessagesSentTotal.labels('public').set(publicMsgRes[0]?.value ?? 0)

      const privateMsgRes = await db
        .select({ value: count() })
        .from(messages)
        .innerJoin(channels, eq(messages.channelId, channels.id))
        .where(eq(channels.type, 'private'))
      chatMessagesSentTotal.labels('private').set(privateMsgRes[0]?.value ?? 0)

      const directMsgRes = await db
        .select({ value: count() })
        .from(messages)
        .innerJoin(channels, eq(messages.channelId, channels.id))
        .where(eq(channels.type, 'direct'))
      chatMessagesSentTotal.labels('direct').set(directMsgRes[0]?.value ?? 0)

      const channelTypes = ['public', 'private', 'direct']
      for (const cType of channelTypes) {
        const chanRes = await db
          .select({ value: count() })
          .from(channels)
          .where(eq(channels.type, cType))
        chatChannelsTotal.labels(cType).set(chanRes[0]?.value ?? 0)
      }
    } catch {
      // ignore database errors during metrics collection
    }

    reply.header('Content-Type', client.register.contentType)
    return await client.register.metrics()
  })
}



