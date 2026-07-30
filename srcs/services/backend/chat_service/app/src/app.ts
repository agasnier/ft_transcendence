import Fastify, { type FastifyInstance } from 'fastify'
import cookie from '@fastify/cookie'
import fastifyWebsocket from '@fastify/websocket'

import { channelsRoutes } from './modules/channels/channels.route.js'
import { messagesRoutes } from './modules/messages/messages.route.js'
import { websocketRoutes } from './modules/websocket/websocket.route.js'
import { metricsRoutes } from './modules/metrics/metrics.route.js'

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  })

  app.register(cookie)
  app.register(fastifyWebsocket)

  // metrics route for prometheus
  app.register(metricsRoutes)

  app.register(channelsRoutes, { prefix: '/chat/channels' })
  app.register(messagesRoutes, { prefix: '/chat/channels' })
  app.register(websocketRoutes, { prefix: '/chat' })

  return app
}

