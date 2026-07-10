import Fastify, { type FastifyInstance } from 'fastify'
import cookie from '@fastify/cookie'

import { usersRoutes } from './modules/users/users.route.js'
import { authRoutes } from './modules/auth/auth.route.js'


// construct the app without launching it
// herite from FasitfyInstance for method get, post, register, listen
export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  })

  app.register(cookie)

  // all module added must be register here
  app.register(usersRoutes, { prefix: '/users' })
  app.register(authRoutes, { prefix: '/users' })

  return app
}
