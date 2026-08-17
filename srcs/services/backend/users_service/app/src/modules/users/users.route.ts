import type { FastifyInstance } from 'fastify'
import { listUsersController, listUsersBatchController, getUserController, createUserController, updateUserController, deleteUserController, updateProfileController, getUserProfileController, uploadAvatarController } from './users.controller.js'
import { listUsersSchema, listUsersBatchSchema, getUserSchema, createUserSchema, updateUserSchema, deleteUserSchema, updateProfileSchema, getUserProfileSchema, uploadAvatarSchema } from './users.schema.js'
import { userAuthHook } from '../auth/auth.controller.js'
import { requireSelfOrRole } from '../auth/permissions.js'


export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', { schema: listUsersSchema, preHandler: [userAuthHook] }, listUsersController) //TODO supprimer le user quand la fonction de recherche user sera dispo
  app.get('/batch', { schema: listUsersBatchSchema }, listUsersBatchController)
  app.get('/:id', { schema: getUserSchema, preHandler: [userAuthHook] }, getUserController)
  app.post('/', { schema: createUserSchema }, createUserController)
  app.put('/:id', { schema: updateUserSchema, preHandler: [userAuthHook, requireSelfOrRole('admin')] }, updateUserController)
  app.delete('/:id', { schema: deleteUserSchema, preHandler: [userAuthHook, requireSelfOrRole('admin')] }, deleteUserController)

  // route whose need to be connected with preHandler
  app.patch('/profile', { schema: updateProfileSchema, preHandler: [userAuthHook] }, updateProfileController)
  app.get('/profile', { schema: getUserProfileSchema, preHandler: [userAuthHook] }, getUserProfileController)
  app.post('/profile/avatar', { schema: uploadAvatarSchema, preHandler: [userAuthHook] }, uploadAvatarController)
}
