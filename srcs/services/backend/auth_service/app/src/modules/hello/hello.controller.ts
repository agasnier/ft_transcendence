import type { FastifyReply, FastifyRequest } from 'fastify'
import { checkDatabase } from './hello.service.js'

export async function getDatabase(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await reply.send(await checkDatabase())
  } catch (err) {
    _request.log.error(err)
    await reply.status(503).send({ message: 'DB injoignable' })
  }
}