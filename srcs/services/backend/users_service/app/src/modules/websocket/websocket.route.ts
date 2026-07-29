import type { FastifyInstance } from 'fastify'

import { userAuthHook } from '../auth/auth.controller.js'
import { wsAddSocket } from './websocket.ws.js'

export async function websocketRoutes(app: FastifyInstance): Promise<void> {
  app.get('/ws', { preHandler: [userAuthHook], websocket: true }, (connection, req) => {
    wsAddSocket(connection, req.user!.id)
  })
}
