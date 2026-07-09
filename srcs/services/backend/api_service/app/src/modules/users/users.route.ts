import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { listUsersController, getUserController, createUserController, updateUserController, deleteUserController } from './users.controller.js'
import { listUsersSchema, getUserSchema, createUserSchema, updateUserSchema, deleteUserSchema } from './users.schema.js'

// TODO test, remplace with a function api_key.service that hash the api key with vault pepper
// and search match into db
const API_KEY = 'alex'

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  // app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  //   const apiKey = request.headers['x-api-key']
  //   if (apiKey !== API_KEY) {
  //     await reply.status(401).send({ message: 'Invalid API key' })
  //     return
  //   }
  // })

  app.get('/', { schema: listUsersSchema }, listUsersController)
  app.get('/:id', { schema: getUserSchema }, getUserController)
  app.post('/', { schema: createUserSchema }, createUserController)
  app.put('/:id', { schema: updateUserSchema }, updateUserController)
  app.delete('/:id', { schema: deleteUserSchema }, deleteUserController)
}