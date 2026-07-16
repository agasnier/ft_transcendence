import type { FastifyInstance } from 'fastify'
import { getApiKeysController, createApiKeysController, updateApiKeysController, deleteApiKeysController, userAuthHook } from './api_keys.controller.js'
import { getApiKeysSchema, createApiKeysSchema, updateApiKeysSchema, deleteApiKeysSchema } from './api_keys.schema.js'


export async function apiKeysRoutes(app: FastifyInstance): Promise<void> {

  app.addHook('preHandler', userAuthHook)

  app.get('/', { schema: getApiKeysSchema }, getApiKeysController)
  app.post('/', { schema: createApiKeysSchema }, createApiKeysController)
  app.put('/', { schema: updateApiKeysSchema }, updateApiKeysController)
  app.delete('/', { schema: deleteApiKeysSchema }, deleteApiKeysController)
}