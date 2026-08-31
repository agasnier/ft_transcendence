import type { FastifyInstance } from 'fastify'
import { userAuthHook } from '../channels/channels.controller.js'
import { uploadFileController, downloadFileController, deleteFileController } from './files.controller.js'
import { uploadFileSchema, fileIdParamSchema } from './files.schema.js'

// Routes for file attachments (images, documents) shared within a channel.
// All routes require authentication; per-file access control (channel membership,
// uploader/admin for deletion) is handled inside each controller.
export async function filesRoutes(app: FastifyInstance): Promise<void> {
  app.post('/:channelId', { schema: uploadFileSchema, preHandler: [userAuthHook] }, uploadFileController)
  app.get('/:id', { schema: fileIdParamSchema, preHandler: [userAuthHook] }, downloadFileController)
  app.delete('/:id', { schema: fileIdParamSchema, preHandler: [userAuthHook] }, deleteFileController)
}