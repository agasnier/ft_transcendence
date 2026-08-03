import type { FastifyReply, FastifyRequest } from 'fastify'

import { validateAccessToken } from '../vault/jwt.js'
import { channelInfo, createChannel, deleteChannel, hideDiscussionForUser, isChannelMember, listAllChannels, listChannelMembers, listUserChannels, resolveDiscussionNames, revealDiscussionForMember } from './channels.service.js'
import { wsChannelCreatedTo, wsChannelDeleted, wsChannelDeletedTo } from '../websocket/websocket.ws.js'

// hooks

// TODO hook is a channel members

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
    const { name, memberIds, type, description } = request.body as { name?: string; memberIds: number[]; type: string; description?: string }
    const { channel, reused } = await createChannel(name, memberIds, type, description, request.user!.id)

    // websocket: a discussion only appears for its creator until the other member gets a message (see messages.controller.ts);
    // channels/groups notify every member immediately like before.
    if (type === 'discussion') {
      if (reused)
        // the pair already had a discussion: make sure it's visible for the caller again (it may have hidden it before)
        await revealDiscussionForMember(channel.id, request.user!.id)

      const [resolvedChannel] = await resolveDiscussionNames([channel], request.user!.id)
      wsChannelCreatedTo(request.user!.id, resolvedChannel)
    } else {
      for (const memberId of memberIds)
        wsChannelCreatedTo(memberId, channel)
    }

    await reply.status(201).send(channel)
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

    if (!(await isChannelMember(channelId, request.user!.id))) {
      await reply.status(403).send({ message: 'Not a channel member' })
      return
    }

    const channel = await channelInfo(channelId)

    if (channel?.type === 'discussion') {
      // hide it for this member only: the discussion still exists for the other member
      await hideDiscussionForUser(channelId, request.user!.id)
      wsChannelDeletedTo(request.user!.id, channelId)
    } else {
      await deleteChannel(channelId)
      wsChannelDeleted(channelId)
    }

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

export async function listAllChannelsController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const allChannels = await listAllChannels(request.user!.id)
    await reply.send(allChannels)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}