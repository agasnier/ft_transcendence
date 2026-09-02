import Fastify, { type FastifyInstance } from 'fastify'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import cookie from '@fastify/cookie'
import path from 'path'

import { usersInternalRoutes, usersRoutes } from './modules/users/users.route.js'
import { friendsRoutes } from './modules/friends/friends.route.js'
import { authRoutes } from './modules/auth/auth.route.js'
import { twofaRoutes } from './modules/twofa/twofa.route.js'
import { metricsRoutes } from './modules/metrics/metrics.route.js'


// construct the app without launching it
// herite from FasitfyInstance for method get, post, register, listen
export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  })

  app.register(cookie)
  app.register(fastifyMultipart, {
    limits: { fileSize: 5 * 1024 * 1024 }, //5MB max
  })
  app.register(fastifyStatic, {
    root: path.join('/app/uploads/avatars'),
    prefix: '/avatars/',
    // uploads located in /app/uploads/avatars/xxx.jpg
    // use this sub directory with the prefix /avatars/
  })

  // metrics route for prometheus
  app.register(metricsRoutes)

  // all module added must be register here
  app.register(usersInternalRoutes, { prefix: '/users/internal' })
  app.register(usersRoutes, { prefix: '/users' })
  app.register(friendsRoutes, { prefix: "/friends" })
  app.register(authRoutes, { prefix: '/auth' })
  app.register(twofaRoutes, { prefix: '/auth/2fa' })

  return app
}
