import Fastify, { type FastifyInstance } from 'fastify'
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

  app.register(swagger, swaggerSettings)
  app.register(scalar, { routePrefix: '/api/docs' })

  // all module added must be register here
  app.register(usersRoutes, { prefix: '/api/users' })
  app.register(apiKeysRoutes, { prefix: '/api/api_keys' })

  return app
}
