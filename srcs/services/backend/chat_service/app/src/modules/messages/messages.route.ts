import type { FastifyInstance } from 'fastify'

import { userAuthHook } from '../channels/channels.controller.js'
import { createMessageController, listMessagesController } from './messages.controller.js'
import { createMessageSchema, listMessagesSchema } from './messages.schema.js'

export async function messagesRoutes(app: FastifyInstance): Promise<void> {
  app.get('/:id/messages', { schema: listMessagesSchema, preHandler: [userAuthHook] }, listMessagesController)
  app.post('/:id/messages', { schema: createMessageSchema, preHandler: [userAuthHook] }, createMessageController)
}
