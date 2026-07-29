import type { FastifyReply, FastifyRequest } from 'fastify'

import { validateAccessToken } from '../vault/jwt.js'
import { createChannel, deleteChannel, isChannelMember, listChannelMembers, listUserChannels } from './channels.service.js'
import { wsChannelCreated, wsChannelDeleted } from '../websocket/websocket.ws.js'

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
export async function createChannelController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { name, memberIds } = request.body as { name?: string; memberIds: number[] }
    const channel = await createChannel(name, memberIds)

    // websocket
    wsChannelCreated(channel)

    await reply.status(201).send()
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
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

export async function deleteChannelController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const channelId = Number(id)
    await deleteChannel(channelId)

    // websocket
    wsChannelDeleted(channelId)
    
    await reply.status(200).send()
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function listChannelMembersController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const channelId = Number(id)

    if (!(await isChannelMember(channelId, request.user!.id))) {
      await reply.status(403).send({ message: 'Not a channel member' })
      return
    }

    const memberIds = await listChannelMembers(channelId)
    await reply.send(memberIds)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}
