import type { FastifyReply, FastifyRequest } from 'fastify'
import { validateAccessToken } from '../vault/jwt.js'
import { getTwoFAByUserId } from './twofa.service.js'

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
  try {
    if (!request.user) {
      await reply.status(401).send({ message: 'Not authenticated' })
      return
    }

    const row = await getTwoFAByUserId(request.user.id)
    await reply.status(200).send({ enabled: row?.enabled ?? false })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function verifyController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
}

export async function disableController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
}
