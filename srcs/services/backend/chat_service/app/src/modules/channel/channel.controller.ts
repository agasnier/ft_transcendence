import type { FastifyReply, FastifyRequest } from 'fastify'

import { validateAccessToken } from '../vault/jwt.js'
import { listUserChannels } from './channel.service.js'

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

export async function listUserChannelsController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    if (!request.user) {
      await reply.status(401).send({ message: 'Not authenticated' })
      return
    }

    const userChannels = await listUserChannels(request.user.id)
    await reply.send(userChannels)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}
