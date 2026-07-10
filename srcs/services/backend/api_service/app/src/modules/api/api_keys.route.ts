import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { listApiKeysController, getApiKeysController, createApiKeysController, updateApiKeysController, deleteApiKeysController } from './api_keys.controller.js'
import { listApiKeysSchema, getApiKeysSchema, createApiKeysSchema, updateApiKeysSchema, deleteApiKeysSchema } from './api_keys.schema.js'


export async function apiKeysRoutes(app: FastifyInstance): Promise<void> {

  // TODO after before prod, bloc external request with header

  app.get('/', { schema: listApiKeysSchema }, listApiKeysController)
  app.get('/:owner_id', { schema: getApiKeysSchema }, getApiKeysController)
  app.post('/', { schema: createApiKeysSchema }, createApiKeysController)
  app.put('/:owner_id', { schema: updateApiKeysSchema }, updateApiKeysController)
  app.delete('/:owner_id', { schema: deleteApiKeysSchema }, deleteApiKeysController)
}