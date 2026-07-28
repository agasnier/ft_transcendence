import Fastify, { type FastifyInstance } from 'fastify'
import cookie from '@fastify/cookie'

import { channelRoutes } from './modules/channel/channel.route.js'
import { messageRoutes } from './modules/message/message.route.js'

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  })

  app.register(cookie)

  app.register(channelRoutes, { prefix: '/channels' })
  app.register(messageRoutes, { prefix: '/messages' })

  return app
}
