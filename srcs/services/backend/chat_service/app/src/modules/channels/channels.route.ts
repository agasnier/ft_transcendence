import type { FastifyInstance } from 'fastify'
import { requireChannelModeratorOrAdmin } from './permissions.js'

import { createChannelController, deleteChannelController, listChannelMembersController, listUserChannelsController, userAuthHook, listAllChannelsController, updateChannelController, removeChannelMemberController } from './channels.controller.js'
import { createChannelSchema, deleteChannelSchema, listChannelMembersSchema, listUserChannelsSchema, listAllChannelsSchema, updateChannelSchema, removeMemberParamSchema } from './channels.schema.js'

export async function channelsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', { schema: listUserChannelsSchema, preHandler: [userAuthHook] }, listUserChannelsController)
  app.post('/', { schema: createChannelSchema, preHandler: [userAuthHook] }, createChannelController)
  app.get('/:id/members', { schema: listChannelMembersSchema, preHandler: [userAuthHook] }, listChannelMembersController)
  app.delete('/:id', { schema: deleteChannelSchema, preHandler: [userAuthHook] }, deleteChannelController)
  app.get('/all', { schema: listAllChannelsSchema, preHandler: [userAuthHook] }, listAllChannelsController)
  app.put('/:id', { schema: updateChannelSchema, preHandler: [userAuthHook, requireChannelModeratorOrAdmin()] }, updateChannelController)
  app.delete('/:id/members/:userId', { schema: removeMemberParamSchema, preHandler: [userAuthHook, requireChannelModeratorOrAdmin()] }, removeChannelMemberController)
}
