import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { listUsers, getUser, createUser } from './users.controller.js'
import { listUsersSchema, getUserSchema, createUserSchema } from './users.schema.js'

// TODO test, remplace with a function api_key.service that hash the api key with vault pepper
// and search match into db
const API_KEY = 'alex'

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const apiKey = request.headers['x-api-key']
    if (apiKey !== API_KEY) {
      await reply.status(401).send({ message: 'Invalid API key' })
      return
    }
  })

  app.get('/', { schema: listUsersSchema }, listUsers)
  app.get('/:id', { schema: getUserSchema }, getUser)
  app.post('/', { schema: createUserSchema }, createUser)
  // app.put('/:id', updateUser)
  // app.delete('/:id', deleteUser)
}