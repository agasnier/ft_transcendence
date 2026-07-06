import Fastify, { type FastifyInstance } from 'fastify'

import { databaseRoutes } from './modules/hello/hello.route.js'


// construct the app without launching it
// herite from FasitfyInstance for method get, post, register, listen
export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  })

  // all module added must be register here
  app.register(databaseRoutes, { prefix: '/api' })

  return app
}
