import Fastify, { type FastifyInstance } from 'fastify'
import cookie from '@fastify/cookie'
import swagger from '@fastify/swagger'
import scalar from '@scalar/fastify-api-reference'

import { swaggerSettings } from './config/swagger.js'
import { usersRoutes } from './modules/users/users.route.js'
import { apiKeysRoutes } from './modules/api_keys/api_keys.route.js'

// construct the app without launching it
// herite from FasitfyInstance for method get, post, register, listen
export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  })

  app.register(cookie)
  app.register(swagger, swaggerSettings)
  app.register(scalar, { routePrefix: '/api/docs' })

  app.register(usersRoutes, { prefix: '/api/users' })
  app.register(apiKeysRoutes, { prefix: '/api/api_keys' })

  app.register(fastifyWebsocket, {
    options: {
      maxPayload: 1048576,
    }
  })

  app.register(async (fastify) => {
    fastify.route({
      method: 'GET',
      url: '/api/ws',
      handler: (req, reply) => {
        reply.status(400).send({ message: 'La connexion nécessite un Upgrade WebSocket.' })
      },
      wsHandler: (connection, req) => {
        void handleWebSocket(connection, req, app)
      }
    })
  })

  startHeartbeatMonitor(app)

  return app
}