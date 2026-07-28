import type { FastifyReply, FastifyRequest } from 'fastify'

import { validateAccessToken } from '../vault/jwt.js'
import { createChannel, deleteChannel, listUserChannels } from './channel.service.js'

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
    const userChannels = await listUserChannels(request.user!.id)
    await reply.send(userChannels)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function createChannelController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { name } = request.body as { name: string }
    await createChannel(name, request.user!.id)
    await reply.status(201).send()
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function deleteChannelController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    await deleteChannel(Number(id))
    await reply.status(200).send()
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}
