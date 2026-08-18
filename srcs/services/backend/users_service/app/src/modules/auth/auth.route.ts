import type { FastifyInstance } from 'fastify'
import { registerController, loginController, logoutController, sessionController, changePasswordController, userAuthHook } from './auth.controller.js'
import { loginSchema, registerSchema, changePasswordSchema } from './auth.schema.js'

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/register', { schema: registerSchema }, registerController)
  app.post('/login', { schema: loginSchema }, loginController)
  app.post('/logout', logoutController)
  app.get('/session', sessionController)
  app.post('/password', { schema: changePasswordSchema, preHandler: [userAuthHook] }, changePasswordController)
}
