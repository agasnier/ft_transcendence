import type { FastifyReply, FastifyRequest } from 'fastify'
import { validateAccessToken } from '../vault/jwt.js'

// hooks
export async function userAuthHook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const accessToken = request.cookies.access_token
  if (!accessToken) {
    await reply.status(401).send({ message: 'Not authenticated' })
    return
  }

  const user = await validateAccessToken(accessToken)
  if (!user) {
    await reply.status(401).send({ message: 'Not authenticated' })
    return
  }

    request.user = user
}

// controllers
export async function enableController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
}

export async function setupController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
}

export async function statusController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
}

export async function verifyController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
}

export async function disableController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
}
