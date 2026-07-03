import type { FastifyReply, FastifyRequest } from 'fastify'

import { hello } from './hello.service.js'

export async function getHello(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await reply.send(hello())
}
