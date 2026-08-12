import type { FastifyInstance } from 'fastify'
import { userAuthHook, enableController, setupController, statusController, verifyController, disableController } from './twofa.controller.js'

export async function twofaRoutes(app: FastifyInstance): Promise<void> {
  app.post('/enable', { preHandler: [userAuthHook] }, enableController)
  app.post('/setup', { preHandler: [userAuthHook] }, setupController)
  app.get('/status', { preHandler: [userAuthHook] }, statusController)
  app.post('/verify', { preHandler: [userAuthHook] }, verifyController)
  app.post('/disable', { preHandler: [userAuthHook] }, disableController)
}
