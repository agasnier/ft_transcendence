import type { FastifyInstance } from 'fastify'
import { loginController, logoutController, sessionController } from './auth.controller.js'
import { loginSchema } from './auth.schema.js'

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/login', { schema: loginSchema }, loginController)
  app.post('/logout', logoutController)
  app.get('/session', sessionController)
}
