import type { FastifyInstance } from 'fastify'

import { createChannelController, deleteChannelController, listChannelMembersController, listUserChannelsController, userAuthHook, listAllChannelsController } from './channels.controller.js'
import { createChannelSchema, deleteChannelSchema, listChannelMembersSchema, listUserChannelsSchema, listAllChannelsSchema } from './channels.schema.js'

export async function channelsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', { schema: listUserChannelsSchema, preHandler: [userAuthHook] }, listUserChannelsController)
  app.post('/', { schema: createChannelSchema, preHandler: [userAuthHook] }, createChannelController)
  app.get('/:id/members', { schema: listChannelMembersSchema, preHandler: [userAuthHook] }, listChannelMembersController)
  app.delete('/:id', { schema: deleteChannelSchema, preHandler: [userAuthHook] }, deleteChannelController)
  app.get('/all', { schema: listAllChannelsSchema, preHandler: [userAuthHook] }, listAllChannelsController)
}
