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

// Creates a new channel (discussion, group, or channel) and notifies the right people
// over WebSocket so the conversation appears live in their client without a refresh.
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

    // For groups/channels, post a system message announcing the creation and mark it
    // as read for the creator so it doesn't show up as unread for them.
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

// Lists all channels the current user belongs to, enriched with unread status
// (comparing the last message id to what this user has last read) and member count
export async function listUserChannelsController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const userChannels = await listUserChannels(request.user!.id)
    const result = await Promise.all(userChannels.map(async (channel) => {
      const lastMessageId = await getLastMessageId(channel.id) ?? 0
      const lastReadId = await getLastReadMessageId(channel.id, request.user!.id) ?? 0
      const memberCount = channel.type !== 'discussion' ? await countChannelMembers(channel.id) : undefined
      return { ...channel, hasUnread: lastMessageId > lastReadId, memberCount }
    }))
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

// Removes the current user from a channel. Behavior depends on the channel type:
// discussion/group: the user just leaves (the channel keeps existing for others);
// if they were the last member, the channel is deleted entirely.
// channel: deleted outright (channels currently have no "leave, keep for others" case).
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

// Lists the members of a channel (id + local role). Requires the caller to be a member.
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

// Lists every channel that exists (not just the ones the user belongs to), so users
// can discover and join public groups/channels. Each entry indicates whether the
// caller is already a member.
export async function listAllChannelsController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const allChannels = await listAllChannels(request.user!.id)
    await reply.send(allChannels)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

// Updates a channel's name and/or description, notifies all members over WebSocket,
// and posts a system message when the name changes so the rename is visible in the chat log.
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

// Removes a member from a channel (moderator/admin action). A non-admin caller cannot
// remove a global admin, even if they're a moderator of this channel (checked by
// fetching the target's profile from users_service). The removed user is notified
// instantly over WebSocket so their client drops the conversation without a refresh.
export async function removeChannelMemberController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id, userId } = request.params as { id: string; userId: string }
    const channelId = Number(id)
    const targetUserId = Number(userId)

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

    await removeChannelMember(channelId, targetUserId)

    // Notify the target to be removed instantaneously
    wsChannelDeletedTo(targetUserId, channelId)

    await reply.send({ message: 'Member removed' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

// Adds one or more members to a channel (always as 'member', never 'moderator').
// Notifies each new member over WebSocket so the conversation shows up instantly.
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

// Promotes/demotes a member's local role in the channel (moderator <-> member).
// Two safeguards: a user can never change their own role, and a non-admin caller
// can't touch a global admin's role even if they're a moderator of this channel.
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

// Switches a channel between "everyone can write" and "moderators only" mode.
// Notifies all members over WebSocket so the message input locks/unlocks live,
// without requiring a page refresh.
export async function updateWriteModeController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const { writeMode } = request.body as { writeMode: 'everyone' | 'moderators_only' }
    const channelId = Number(id)
    const channel = await updateWriteMode(channelId, writeMode)

    // Notify users that write mode changed
    if (channel) {
      const members = await listChannelMembers(channelId)
      for (const { userId } of members)
        wsChannelUpdatedTo(userId, channel)
    }

    await reply.send(channel)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

// Uploads a new avatar/logo for a channel. Validates the file type, deletes the
// previous avatar from disk (if any) to avoid orphaned files, stores the new one
// under a randomized filename, and notifies all members over WebSocket.
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

// Removes a channel's avatar/logo (reverts to the default fallback letter avatar
// on the frontend) and notifies all members over WebSocket.
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

