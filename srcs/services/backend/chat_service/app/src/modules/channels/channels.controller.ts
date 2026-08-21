import type { FastifyReply, FastifyRequest } from 'fastify'
import { randomUUID } from 'crypto'
import path from 'path'
import { pipeline } from 'stream/promises'
import { createWriteStream } from 'fs'
import { unlink } from 'fs/promises'
import { validateAccessToken } from '../vault/jwt.js'
import { channelInfo, createChannel, deleteChannel, isChannelMember, leaveChannel, listAllChannels, listChannelMembers, listUserChannels, resolveDiscussionNames, updateChannel, removeChannelMember, addChannelMembers, updateMemberRole, updateWriteMode, countChannelMembers, getLastMessageId, getLastReadMessageId, markChannelRead, updateChannelAvatar, deleteChannelAvatar } from './channels.service.js'
import { wsChannelCreatedTo, wsChannelDeleted, wsChannelDeletedTo, wsChannelUpdatedTo, wsMessageCreated } from '../websocket/websocket.ws.js'
import { createMessage } from '../messages/messages.service.js'
import { env } from '../../config/env.js'

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
    const { name, memberIds, type, description } = request.body as { name?: string; memberIds: number[]; type: string; description?: string }
    const { channel } = await createChannel(name, memberIds, type, description, request.user!.id)

    // websocket: a discussion only appears for its creator until the other member gets a message (see messages.controller.ts);
    // channels/groups notify every member immediately like before.
    if (type === 'discussion') {
      const [resolvedChannel] = await resolveDiscussionNames([channel], request.user!.id)
      wsChannelCreatedTo(request.user!.id, resolvedChannel)
    } else {
      for (const memberId of memberIds)
        wsChannelCreatedTo(memberId, channel)
    }

    if (type === 'group') {
      const message = await createMessage(channel.id, request.user!.id, ' a créé le groupe', 'system')
      await markChannelRead(channel.id, request.user!.id)
      wsMessageCreated(message)
    }

    if (type === 'channel') {
      const message = await createMessage(channel.id, request.user!.id, ' a créé le canal', 'system')
      await markChannelRead(channel.id, request.user!.id)
      wsMessageCreated(message)
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
    const result = []
    for (const channel of userChannels) {
      const lastMessageId = await getLastMessageId(channel.id) ?? 0
      const lastReadId = await getLastReadMessageId(channel.id, request.user!.id) ?? 0
      result.push({ ...channel, hasUnread: lastMessageId > lastReadId })
    }
    await reply.send(result)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function markChannelReadController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const channelId = Number(id)
    const ok = await markChannelRead(channelId, request.user!.id)
    if (!ok) {
      await reply.status(403).send({ message: 'Not a channel member' })
      return
    }
    await reply.status(204).send()
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

    if (channel?.type === 'discussion' || channel?.type === 'group') {
      // leave it for this member only: the channel still exists for the other members
      await leaveChannel(channelId, request.user!.id)
      wsChannelDeletedTo(request.user!.id, channelId)

       // if no one is left in the channel, delete it entirely
      const remaining = await countChannelMembers(channelId)
      if (remaining === 0) {
        await deleteChannel(channelId)
        wsChannelDeleted(channelId)
      }
      
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

export async function updateChannelController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const { name, description } = request.body as { name?: string; description?: string }
    const channelId = Number(id)
    const channel = await updateChannel(channelId, { name, description })

    if (channel) {
      const members = await listChannelMembers(channelId)
      for (const {userId} of members)
        wsChannelUpdatedTo(userId, channel)

      if (name) {
        const message = await createMessage(channelId, request.user!.id, ` a renommé le groupe en "${name}"`, 'system')
        wsMessageCreated(message)
      }
    }
    await reply.send(channel)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function removeChannelMemberController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id, userId } = request.params as { id: string; userId: string }

    if (request.user!.role !== 'admin') {
      const targetRes = await fetch(`${env.usersServiceUrl}/users/${userId}/profile`)
      if (targetRes.ok) {
        const targetProfile = await targetRes.json()
        if (targetProfile.role === 'admin') {
          await reply.status(403).send({ message: 'Cannot remove an admin from the channel' })
          return
        }
      }
    }

    await removeChannelMember(Number(id), Number(userId))
    await reply.send({ message: 'Member removed' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function addChannelMembersController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const { memberIds } = request.body as { memberIds: number[] }
    const channelId = Number(id)

    await addChannelMembers(channelId, memberIds, 'member')

    // notify all new members to show the conversation
    const channel = await channelInfo(channelId)
    if (channel) {
      for (const memberId of memberIds)
        wsChannelCreatedTo(memberId, channel)
    }

    await reply.status(201).send({ message: 'Members added' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function updateMemberRoleController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id, userId } = request.params as { id: string; userId: string }
    const { role } = request.body as { role: 'moderator' | 'member' }

    // user can't change their own role
    if (Number(userId) === request.user!.id) {
      await reply.status(403).send({ message: 'Cannot change your own role' })
      return
    }

    // moderator can't retrograde admin
    if (request.user!.role !== 'admin') {
      const targetRes = await fetch(`${env.usersServiceUrl}/users/${userId}/profile`)
      if (targetRes.ok) {
        const targetProfile = await targetRes.json()
        if (targetProfile.role === 'admin') {
          await reply.status(403).send({ message: 'Cannot change an admin\'s role' })
          return
        }
      }
    }

    await updateMemberRole(Number(id), Number(userId), role)
    await reply.send({ message: 'Member role updated' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function updateWriteModeController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const { writeMode } = request.body as { writeMode: 'everyone' | 'moderators_only' }
    const channel = await updateWriteMode(Number(id), writeMode)
    await reply.send(channel)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function uploadChannelAvatarController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const channelId = Number(id)

    const data = await request.file()
    if (!data) {
      await reply.status(400).send({ message: 'No file provided' })
      return
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(data.mimetype)) {
      await reply.status(400).send({ message: 'Invalid file type' })
      return
    }

    // delete previous avatar if exists
    const currentChannel = await channelInfo(channelId)
    if (currentChannel?.avatarUrl) {
      const oldFilename = currentChannel.avatarUrl.replace('/chat/avatars/', '')
      await unlink(path.join(env.uploadsDir, 'avatars', oldFilename)).catch(() => {})
    }

    const filename = `${randomUUID()}${path.extname(data.filename)}`
    const filepath = path.join(env.uploadsDir, 'avatars', filename)
    await pipeline(data.file, createWriteStream(filepath))

    const avatarUrl = `/chat/avatars/${filename}`
    const updated = await updateChannelAvatar(channelId, avatarUrl)

    if (updated) {
      const members = await listChannelMembers(channelId)
      for (const { userId } of members) {
        wsChannelUpdatedTo(userId, updated)
      }
    }

    await reply.send({ avatarUrl })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function deleteChannelAvatarController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const channelId = Number(id)

    const updated = await deleteChannelAvatar(channelId)
    if (updated) {
      const members = await listChannelMembers(channelId)
      for (const { userId } of members) {
        wsChannelUpdatedTo(userId, updated)
      }
    }

    await reply.send({ message: 'Avatar removed' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

