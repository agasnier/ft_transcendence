import type { FastifyReply, FastifyRequest } from 'fastify'

import { channelInfo, ensureMembership, getOtherDiscussionParticipant, isChannelMember, markChannelRead, resolveDiscussionNames } from '../channels/channels.service.js'
import { createMessage, listMessages } from './messages.service.js'
import { wsChannelCreatedTo, wsMessageCreated } from '../websocket/websocket.ws.js'
import { getMemberRole } from '../channels/channels.service.js'

// controllers
export async function listMessagesController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const channelId = Number(id)

    if (!(await isChannelMember(channelId, request.user!.id))) {
      await reply.status(403).send({ message: 'Not a channel member' })
      return
    }

    const channelMessages = await listMessages(channelId)
    await reply.send(channelMessages)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function createMessageController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const { content } = request.body as { content: string }
    const channelId = Number(id)

    if (!(await isChannelMember(channelId, request.user!.id))) {
      await reply.status(403).send({ message: 'Not a channel member' })
      return
    }

    // a discussion only shows up for a member once they have a channel_members row;
    // give the other participant one now if they don't have it yet (first message ever,
    // or they'd left/hidden it before) and reveal the channel to them
    const channel = await channelInfo(channelId)

    if (channel?.writeMode === 'moderators_only' && request.user!.role !== 'admin') {
      const memberRole = await getMemberRole(channelId, request.user!.id)
      if (memberRole !== 'moderator') {
        await reply.status(403).send({ message: 'Only moderators can write in this channel' })
        return
      }
    }

    const message = await createMessage(channelId, request.user!.id, content)
    await markChannelRead(channelId, request.user!.id)

    if (channel?.type === 'discussion') {
      const otherUserId = await getOtherDiscussionParticipant(channelId, request.user!.id)
      if (otherUserId !== null && (await ensureMembership(channelId, otherUserId))) {
        const [resolvedChannel] = await resolveDiscussionNames([channel], otherUserId)
        wsChannelCreatedTo(otherUserId, resolvedChannel)
      }
    }

    // websocket
    wsMessageCreated(message)

    await reply.status(201).send(message)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}
