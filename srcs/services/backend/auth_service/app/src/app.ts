import Fastify, { type FastifyInstance } from 'fastify'

import { env } from './config/env.js'
import { helloRoutes } from './modules/hello/hello.route.js'


// construct the app without launching it
// herite from FasitfyInstance for method get, post, register, listen
export function buildApp(): FastifyInstance {
  // log activated only in dev mode
  const app = Fastify({
    logger: !env.isProduction,
  })

  // all module added must be register here
  app.register(helloRoutes, { prefix: '/api' })

  return app
}
