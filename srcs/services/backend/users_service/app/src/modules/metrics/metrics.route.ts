import type { FastifyInstance } from 'fastify'
import client from 'prom-client'
import { count, eq, gt } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { friends, jwtRefreshToken, twoFA, users } from '../../db/schema.js'

client.register.clear()

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 3, 5],
})

const usersActiveConnections = new client.Gauge({
  name: 'users_active_connections',
  help: 'Number of active user connections',
})

const usersRegisteredTotal = new client.Gauge({
  name: 'users_registered_total',
  help: 'Total number of registered users',
})

const usersAdminsTotal = new client.Gauge({
  name: 'users_admins_total',
  help: 'Total number of admin users',
})

const users2faEnabledTotal = new client.Gauge({
  name: 'users_2fa_enabled_total',
  help: 'Total number of users with 2FA enabled',
})

const jwtActiveTokensTotal = new client.Gauge({
  name: 'jwt_active_tokens_total',
  help: 'Number of active non-expired JWT refresh tokens',
})

const friendsPairsTotal = new client.Gauge({
  name: 'friends_pairs_total',
  help: 'Total number of accepted friend relationships',
})

const friendsPendingTotal = new client.Gauge({
  name: 'friends_pending_total',
  help: 'Total number of pending friend requests',
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
      // const activeRes = await db
      //   .select({ value: count() })
      //   .from(users)
      //   .where(eq(users.isOnline, true))
      // usersActiveConnections.set(activeRes[0]?.value ?? 0)

      const registeredRes = await db.select({ value: count() }).from(users)
      usersRegisteredTotal.set(registeredRes[0]?.value ?? 0)

      const adminsRes = await db
        .select({ value: count() })
        .from(users)
        .where(eq(users.role, 'admin'))
      usersAdminsTotal.set(adminsRes[0]?.value ?? 0)

      const twoFaRes = await db
        .select({ value: count() })
        .from(twoFA)
        .where(eq(twoFA.enabled, true))
      users2faEnabledTotal.set(twoFaRes[0]?.value ?? 0)

      const jwtRes = await db
        .select({ value: count() })
        .from(jwtRefreshToken)
        .where(gt(jwtRefreshToken.expires_at, new Date()))
      jwtActiveTokensTotal.set(jwtRes[0]?.value ?? 0)

      const friendsAcceptedRes = await db
        .select({ value: count() })
        .from(friends)
        .where(eq(friends.status, 'accepted'))
      friendsPairsTotal.set(friendsAcceptedRes[0]?.value ?? 0)

      const friendsPendingRes = await db
        .select({ value: count() })
        .from(friends)
        .where(eq(friends.status, 'pending'))
      friendsPendingTotal.set(friendsPendingRes[0]?.value ?? 0)
    } catch {
      // ignore database errors during metrics collection
    }

    reply.header('Content-Type', client.register.contentType)
    return await client.register.metrics()
  })
}


