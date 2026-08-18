import type { FastifyReply, FastifyRequest } from 'fastify'

import { channelInfo, ensureMembership, getOtherDiscussionParticipant, isChannelMember, markChannelRead, resolveDiscussionNames, getMemberRole } from '../channels/channels.service.js'
import { createMessage, listMessages, getMessageById, updateMessageContent, deleteMessage, getUserRole } from './messages.service.js'
import { wsChannelCreatedTo, wsMessageCreated, wsMessageUpdated, wsMessageDeleted } from '../websocket/websocket.ws.js'

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


export async function updateMessageController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { messageId } = request.params as { id: string; messageId: string }
    const { content } = request.body as { content: string }

    const message = await getMessageById(Number(messageId))
    if (!message) {
      await reply.status(404).send({ message: 'Message not found' })
      return
    }

    // only the author can change his own message
    if (message.senderId !== request.user!.id) {
      await reply.status(403).send({ message: 'You can only edit your own messages' })
      return
    }

    if (message.type !== 'user' || message.fileId !== null) {
      await reply.status(400).send({ message: 'This message cannot be edited' })
      return
    }

    const updated = await updateMessageContent(Number(messageId), content)
    if (updated) wsMessageUpdated(updated)

    await reply.send(updated)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function deleteMessageController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id, messageId } = request.params as { id: string; messageId: string }
    const channelId = Number(id)

    const message = await getMessageById(Number(messageId))
    if (!message) {
      await reply.status(404).send({ message: 'Message not found' })
      return
    }

    const isOwnMessage = message.senderId === request.user!.id

    if (!isOwnMessage) {
      // only moderator or admin can change other message
      // but admin's message can only be change by admin
      if (request.user!.role !== 'admin') {
        const senderRole = await getUserRole(message.senderId)
        if (senderRole === 'admin') {
          await reply.status(403).send({ message: 'Cannot delete an admin\'s message' })
          return
        }

        const myRole = await getMemberRole(channelId, request.user!.id)
        if (myRole !== 'moderator') {
          await reply.status(403).send({ message: 'Not allowed to delete this message' })
          return
        }
      }
    }

    await deleteMessage(Number(messageId))
    wsMessageDeleted(Number(messageId), channelId)

    await reply.send({ message: 'Message deleted' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}
