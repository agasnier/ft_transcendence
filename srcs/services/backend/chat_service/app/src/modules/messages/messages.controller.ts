import type { FastifyReply, FastifyRequest } from 'fastify'

import { channelInfo, isChannelMember, listChannelMembers, resolveDiscussionNames, revealDiscussionForMember } from '../channels/channels.service.js'
import { countMessages, createMessage, listMessages } from './messages.service.js'
import { wsChannelCreatedTo, wsMessageCreated } from '../websocket/websocket.ws.js'

// TODO hook is a channel members

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

    const message = await createMessage(channelId, request.user!.id, content)

    // reveal the discussion to any other member for whom it was still hidden:
    // either because they'd deleted it before (hiddenAt cleared here) or because
    // this is the very first message they've ever received in it.
    const channel = await channelInfo(channelId)
    if (channel?.type === 'discussion') {
      const messageCount = await countMessages(channelId)
      const memberIds = await listChannelMembers(channelId)
      for (const memberId of memberIds) {
        if (memberId === request.user!.id)
          continue

        const wasHidden = await revealDiscussionForMember(channelId, memberId)
        const isFirstMessageEver = messageCount === 1 && channel.creatorId !== memberId

        if (wasHidden || isFirstMessageEver) {
          const [resolvedChannel] = await resolveDiscussionNames([channel], memberId)
          wsChannelCreatedTo(memberId, resolvedChannel)
        }
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
