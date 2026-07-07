import type { FastifyInstance } from 'fastify'
import { listUsers, getUser } from './users.controller.js'

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', listUsers)
  app.get('/:id', getUser)
  // app.post('/', createUser)
  // // app.put('/:id', updateUser)
  // app.delete('/:id', deleteUser)
}