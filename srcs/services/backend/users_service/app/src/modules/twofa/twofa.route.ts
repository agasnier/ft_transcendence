import type { FastifyInstance } from 'fastify'
import { userAuthHook, pending2FAHook, enableController, setupController, statusController, verifyController, disableController } from './twofa.controller.js'
import { disableSchema, verifySchema } from './twofa.schema.js'

export async function twofaRoutes(app: FastifyInstance): Promise<void> {
  app.post('/enable', { preHandler: [userAuthHook] }, enableController)
  app.post('/setup', { preHandler: [userAuthHook] }, setupController)
  app.get('/status', { preHandler: [userAuthHook] }, statusController)
  app.post<{ Body: { code: string } }>('/verify', { schema: verifySchema, preHandler: [pending2FAHook] }, verifyController)
  app.post<{ Body: { code: string } }>('/disable', { schema: disableSchema, preHandler: [userAuthHook] }, disableController)
}
