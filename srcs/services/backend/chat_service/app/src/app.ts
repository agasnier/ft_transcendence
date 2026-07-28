import Fastify, { type FastifyInstance } from 'fastify'

import { chatRoutes } from './modules/chat/chat.route.js'
import { roomRoutes } from './modules/room/room.route.js'

// construct the app without launching it
export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  })

  // all modules must be registered here
  app.register(chatRoutes, { prefix: '/chat' })
  app.register(roomRoutes, { prefix: '/rooms' })

  return app
}
