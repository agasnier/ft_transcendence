import type { FastifyInstance } from 'fastify'
import { listUsersController, getUserController, createUserController, updateUserController, deleteUserController, updateProfileController, getUserProfileController, uploadAvatarController } from './users.controller.js'
import { listUsersSchema, getUserSchema, createUserSchema, updateUserSchema, deleteUserSchema, updateProfileSchema, getUserProfileSchema, uploadAvatarSchema } from './users.schema.js'
import { userAuthHook } from '../auth/auth.controller.js'


export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', { schema: listUsersSchema }, listUsersController)
  app.get('/:id', { schema: getUserSchema }, getUserController)
  app.post('/', { schema: createUserSchema }, createUserController)
  app.put('/:id', { schema: updateUserSchema }, updateUserController)
  app.delete('/:id', { schema: deleteUserSchema }, deleteUserController)

  // route whose need to be connected with preHandler
  app.patch('/profile', { schema: updateProfileSchema, preHandler: [userAuthHook] }, updateProfileController)
  app.get('/profile', { schema: getUserProfileSchema, preHandler: [userAuthHook] }, getUserProfileController)
  app.post('/profile/avatar', { schema: uploadAvatarSchema, preHandler: [userAuthHook] }, uploadAvatarController)
}
