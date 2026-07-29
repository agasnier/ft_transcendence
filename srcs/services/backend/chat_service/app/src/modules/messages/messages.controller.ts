import type { FastifyReply, FastifyRequest } from 'fastify'

import { isChannelMember } from '../channels/channels.service.js'
import { createMessage, listMessages } from './messages.service.js'
import { wsMessageCreated } from '../websocket/websocket.ws.js'

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

    // websocket
    wsMessageCreated(message)

    await reply.status(201).send(message)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}
