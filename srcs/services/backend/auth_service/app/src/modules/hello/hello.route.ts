import type { FastifyInstance } from 'fastify'

import { getHello } from './hello.controller.js'
import { helloSchem } from './hello.schema.js'

export async function helloRoutes(app: FastifyInstance): Promise<void> {
  app.get('/hello', { schema: helloSchem }, getHello)
}
