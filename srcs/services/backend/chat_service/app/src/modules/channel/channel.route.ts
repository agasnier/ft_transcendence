import type { FastifyInstance } from 'fastify'

import { listUserChannelsController, userAuthHook } from './channel.controller.js'
import { listUserChannelsSchema } from './channel.schema.js'

export async function channelRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', { schema: listUserChannelsSchema, preHandler: [userAuthHook] }, listUserChannelsController)
}
