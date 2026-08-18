import type { FastifyInstance } from 'fastify'
import { listUsersController, listUsersBatchController, getUserController, createUserController, updateUserController, deleteUserController, updateProfileController, getUserProfileController, uploadAvatarController, getPublicUserProfileController } from './users.controller.js'
import { listUsersSchema, listUsersBatchSchema, getUserSchema, createUserSchema, updateUserSchema, deleteUserSchema, updateProfileSchema, getUserProfileSchema, uploadAvatarSchema, getPublicUserProfileSchema } from './users.schema.js'
import { userAuthHook } from '../auth/auth.controller.js'
import { requireSelfOrRole } from '../auth/permissions.js'


export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', { schema: listUsersSchema, preHandler: [userAuthHook] }, listUsersController)
  app.get('/batch', { schema: listUsersBatchSchema }, listUsersBatchController)
  app.get('/:id', { schema: getUserSchema, preHandler: [userAuthHook] }, getUserController)
  app.post('/', { schema: createUserSchema }, createUserController)
  app.put('/:id', { schema: updateUserSchema, preHandler: [userAuthHook, requireSelfOrRole('admin')] }, updateUserController)
  app.delete('/:id', { schema: deleteUserSchema, preHandler: [userAuthHook, requireSelfOrRole('admin')] }, deleteUserController)
  app.patch('/profile', { schema: updateProfileSchema, preHandler: [userAuthHook] }, updateProfileController)
  app.get('/profile', { schema: getUserProfileSchema, preHandler: [userAuthHook] }, getUserProfileController)
  app.post('/profile/avatar', { schema: uploadAvatarSchema, preHandler: [userAuthHook] }, uploadAvatarController)
  app.get('/:id/profile', { schema: getPublicUserProfileSchema, preHandler: [userAuthHook] }, getPublicUserProfileController)
}
