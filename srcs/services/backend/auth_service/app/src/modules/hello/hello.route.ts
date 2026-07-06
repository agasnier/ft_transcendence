import type { FastifyInstance } from 'fastify'
import { getDatabase} from './hello.controller.js'

export async function databaseRoutes(app: FastifyInstance): Promise<void> {
  app.get('/hello', getDatabase)
}