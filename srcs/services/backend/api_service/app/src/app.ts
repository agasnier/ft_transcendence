import Fastify, { type FastifyInstance } from 'fastify'

import { usersRoutes } from './modules/users/users.route.js'


// construct the app without launching it
// herite from FasitfyInstance for method get, post, register, listen
export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  })

  // all module added must be register here
  app.register(usersRoutes, { prefix: '/api/users' })

  return app
}
