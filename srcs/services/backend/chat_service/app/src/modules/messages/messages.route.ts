import type { FastifyInstance } from 'fastify'

import { userAuthHook } from '../channels/channels.controller.js'
import { createMessageController, listMessagesController, updateMessageController, deleteMessageController } from './messages.controller.js'
import { createMessageSchema, listMessagesSchema, updateMessageSchema, deleteMessageSchema } from './messages.schema.js'

export async function messagesRoutes(app: FastifyInstance): Promise<void> {
  app.get('/:id/messages', { schema: listMessagesSchema, preHandler: [userAuthHook] }, listMessagesController)
  app.post('/:id/messages', { schema: createMessageSchema, preHandler: [userAuthHook] }, createMessageController)
  app.put('/:id/messages/:messageId', { schema: updateMessageSchema, preHandler: [userAuthHook] }, updateMessageController)
  app.delete('/:id/messages/:messageId', { schema: deleteMessageSchema, preHandler: [userAuthHook] }, deleteMessageController)
}
