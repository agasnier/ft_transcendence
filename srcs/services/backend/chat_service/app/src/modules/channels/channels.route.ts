import type { FastifyInstance } from 'fastify'
import { requireChannelModeratorOrAdmin } from './permissions.js'

import { createChannelController, deleteChannelController, listChannelMembersController, listUserChannelsController, markChannelReadController, userAuthHook, listAllChannelsController, updateChannelController, removeChannelMemberController, addChannelMembersController, updateMemberRoleController, updateWriteModeController, uploadChannelAvatarController, deleteChannelAvatarController } from './channels.controller.js'
import { createChannelSchema, deleteChannelSchema, listChannelMembersSchema, listUserChannelsSchema, markChannelReadSchema, listAllChannelsSchema, updateChannelSchema, removeMemberParamSchema, addMemberSchema, updateMemberRoleSchema, updateWriteModeSchema, uploadChannelAvatarSchema, deleteChannelAvatarSchema } from './channels.schema.js'

export async function channelsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', { schema: listUserChannelsSchema, preHandler: [userAuthHook] }, listUserChannelsController)
  app.post('/', { schema: createChannelSchema, preHandler: [userAuthHook] }, createChannelController)
  app.patch('/:id/read', { schema: markChannelReadSchema, preHandler: [userAuthHook] }, markChannelReadController)
  app.get('/:id/members', { schema: listChannelMembersSchema, preHandler: [userAuthHook] }, listChannelMembersController)
  app.delete('/:id', { schema: deleteChannelSchema, preHandler: [userAuthHook] }, deleteChannelController)
  app.get('/all', { schema: listAllChannelsSchema, preHandler: [userAuthHook] }, listAllChannelsController)
  app.put('/:id', { schema: updateChannelSchema, preHandler: [userAuthHook, requireChannelModeratorOrAdmin()] }, updateChannelController)
  app.post('/:id/avatar', { schema: uploadChannelAvatarSchema, preHandler: [userAuthHook, requireChannelModeratorOrAdmin()] }, uploadChannelAvatarController)
  app.delete('/:id/avatar', { schema: deleteChannelAvatarSchema, preHandler: [userAuthHook, requireChannelModeratorOrAdmin()] }, deleteChannelAvatarController)
  app.delete('/:id/members/:userId', { schema: removeMemberParamSchema, preHandler: [userAuthHook, requireChannelModeratorOrAdmin()] }, removeChannelMemberController)
  app.post('/:id/members', { schema: addMemberSchema, preHandler: [userAuthHook, requireChannelModeratorOrAdmin()] }, addChannelMembersController)
  app.put('/:id/members/:userId/role', { schema: updateMemberRoleSchema, preHandler: [userAuthHook, requireChannelModeratorOrAdmin()] }, updateMemberRoleController)
  app.put('/:id/write-mode', { schema: updateWriteModeSchema, preHandler: [userAuthHook, requireChannelModeratorOrAdmin()] }, updateWriteModeController)
}
