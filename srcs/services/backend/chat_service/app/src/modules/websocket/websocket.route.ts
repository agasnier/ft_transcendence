import type { FastifyInstance } from 'fastify'

import { userAuthHook } from '../channels/channels.controller.js'
import { wsAddChannelSocket } from './websocket.ws.js'

export async function websocketRoutes(app: FastifyInstance): Promise<void> {
  app.get('/ws', { preHandler: [userAuthHook], websocket: true }, (connection, request) => {
    wsAddChannelSocket(connection, request.user!.id)
  })
}
