import type { FastifyInstance } from 'fastify'
import { listUsersController, listUsersBatchController, getUserController, createUserController, updateUserController, deleteUserController, updateProfileController, getUserProfileController, uploadAvatarController, getPublicUserProfileController, deleteAvatarController } from './users.controller.js'
import { listUsersSchema, listUsersBatchSchema, getUserSchema, createUserSchema, updateUserSchema, deleteUserSchema, updateProfileSchema, getUserProfileSchema, uploadAvatarSchema, getPublicUserProfileSchema, deleteAvatarSchema } from './users.schema.js'
import { userAuthHook } from '../auth/auth.controller.js'
import { requireSelfOrRole } from '../auth/permissions.js'

function registerUserCrud(app: FastifyInstance, withCookie: boolean): void {
  const read = withCookie ? { preHandler: [userAuthHook] } : {}
  const write = withCookie ? { preHandler: [userAuthHook, requireSelfOrRole('admin')] } : {}

  app.get('/', { schema: listUsersSchema, ...read }, listUsersController)
  app.get('/:id', { schema: getUserSchema, ...read }, getUserController)
  app.post('/', { schema: createUserSchema, ...read }, createUserController)
  app.put('/:id', { schema: updateUserSchema, ...write }, updateUserController)
  app.delete('/:id', { schema: deleteUserSchema, ...write }, deleteUserController)
}

// Docker-only: nginx denies /users/internal. Same controllers, no cookie.
export async function usersInternalRoutes(app: FastifyInstance): Promise<void> {
  registerUserCrud(app, false)
}

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  registerUserCrud(app, true)
  app.get('/batch', { schema: listUsersBatchSchema }, listUsersBatchController)
  app.patch('/profile', { schema: updateProfileSchema, preHandler: [userAuthHook] }, updateProfileController)
  app.get('/profile', { schema: getUserProfileSchema, preHandler: [userAuthHook] }, getUserProfileController)
  app.post('/profile/avatar', { schema: uploadAvatarSchema, preHandler: [userAuthHook] }, uploadAvatarController)
  app.get('/:id/profile', { schema: getPublicUserProfileSchema }, getPublicUserProfileController)
  app.delete('/profile/avatar', { schema: deleteAvatarSchema, preHandler: [userAuthHook] }, deleteAvatarController)
}
