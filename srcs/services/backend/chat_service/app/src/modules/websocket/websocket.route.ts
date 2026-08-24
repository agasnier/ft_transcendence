import type { FastifyInstance } from 'fastify'

import { userAuthHook } from '../channels/channels.controller.js'
import { wsAddChannelSocket, wsForceDisconnect } from './websocket.ws.js'

export async function websocketRoutes(app: FastifyInstance): Promise<void> {
  app.get('/ws', { preHandler: [userAuthHook], websocket: true }, (connection, request) => {
    wsAddChannelSocket(connection, request.user!.id)
  })

  // intern route, only called by users_service
  app.post('/internal/force-disconnect/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string }
    wsForceDisconnect(Number(userId))
    await reply.status(204).send()
  })
}