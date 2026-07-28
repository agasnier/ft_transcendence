import type { FastifyInstance } from 'fastify'

import {
  createChannelController,
  deleteChannelController,
  listUserChannelsController,
  userAuthHook,
} from './channel.controller.js'
import {
  createChannelSchema,
  deleteChannelSchema,
  listUserChannelsSchema,
} from './channel.schema.js'

export async function channelRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', { schema: listUserChannelsSchema, preHandler: [userAuthHook] }, listUserChannelsController)
  app.post('/', { schema: createChannelSchema, preHandler: [userAuthHook] }, createChannelController)
  app.delete('/:id', { schema: deleteChannelSchema, preHandler: [userAuthHook] }, deleteChannelController)
}
