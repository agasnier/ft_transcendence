import type { FastifyInstance } from 'fastify'
import rateLimit from '@fastify/rate-limit'
import { listUsersController, getUserController, createUserController, updateUserController, deleteUserController } from './users.controller.js'
import { listUsersSchema, getUserSchema, createUserSchema, updateUserSchema, deleteUserSchema } from './users.schema.js'
import { apiKeyAuthHook } from '../api_keys/api_keys.controller.js'


export async function usersRoutes(app: FastifyInstance): Promise<void> {
  // get the role
  app.addHook('onRequest', apiKeyAuthHook)

  // rate-limit
  await app.register(rateLimit, {
    max: 5,
    timeWindow: '1 minute',
    keyGenerator: (req) => String(req.user?.id),
  })

  app.get('/', { schema: listUsersSchema }, listUsersController)
  app.get('/:id', { schema: getUserSchema }, getUserController)
  app.post('/', { schema: createUserSchema }, createUserController)
  app.put('/:id', { schema: updateUserSchema }, updateUserController)
  app.delete('/:id', { schema: deleteUserSchema }, deleteUserController)
}