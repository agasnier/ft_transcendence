import type { FastifyInstance } from 'fastify'
import { listUsersController, getUserController, createUserController, updateUserController, deleteUserController } from './users.controller.js'
import { listUsersSchema, getUserSchema, createUserSchema, updateUserSchema, deleteUserSchema } from './users.schema.js'


export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', { schema: listUsersSchema }, listUsersController)
  app.get('/:id', { schema: getUserSchema }, getUserController)
  app.post('/', { schema: createUserSchema }, createUserController)
  app.put('/:id', { schema: updateUserSchema }, updateUserController)
  app.delete('/:id', { schema: deleteUserSchema }, deleteUserController)
}