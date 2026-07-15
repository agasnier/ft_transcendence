import type { FastifyInstance } from 'fastify'
import rateLimit from '@fastify/rate-limit'
import { listUsersController, getUserController, createUserController, updateUserController, deleteUserController } from './users.controller.js'
import { apiKeyAuthHook } from '../api_keys/api_keys.controller.js'


export async function usersRoutes(app: FastifyInstance): Promise<void> {
  // get the role
  app.addHook('onRequest', apiKeyAuthHook)

  // rate-limit
  await app.register(rateLimit, {
    max: 5,
    timeWindow: '1 minute',
    keyGenerator: (req) => String(req.auth?.ownerId),
  })

  app.get('/', listUsersController)
  app.get('/:id', getUserController)
  app.post('/', createUserController)
  app.put('/:id', updateUserController)
  app.delete('/:id', deleteUserController)
}