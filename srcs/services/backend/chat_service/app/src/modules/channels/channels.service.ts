import { and, desc, eq, inArray } from 'drizzle-orm'
import { unlink } from 'fs/promises'
import path from 'path'
import { db } from '../../db/index.js'
import { channels, channelMembers, discussionPairs, messages } from '../../db/schema.js'
import { env } from '../../config/env.js'

type ChannelRow = {
  id: number
  name: string | null
  type: string
  description: string | null
  avatarUrl?: string | null
  writeMode?: 'everyone' | 'moderators_only'
  createdAt: Date
  otherUserId?: number
}

// For discussion-type channels, fills in the display name/avatar with the other
// participant's pseudo/avatar (fetched from users_service), since a discussion
// has no name/avatar of its own. Non-discussion channels pass through unchanged
export async function resolveDiscussionNames(rows: ChannelRow[], userId: number): Promise<ChannelRow[]> {
  const discussionIds = rows.filter((c) => c.type === 'discussion').map((c) => c.id)
  if (discussionIds.length === 0)
    return rows

  // the pair record is the permanent source of truth for "who's in this discussion",
  // independent of whether either side currently has a channel_members row
  const pairs = await db
    .select({ channelId: discussionPairs.channelId, userMinId: discussionPairs.userMinId, userMaxId: discussionPairs.userMaxId })
    .from(discussionPairs)
    .where(inArray(discussionPairs.channelId, discussionIds))

  // For each discussion, figure out who the "other" person is relative to the caller.
  const otherUserIdByChannel = new Map(
    pairs.map((p) => [p.channelId, p.userMinId === userId ? p.userMaxId : p.userMinId]),
  )
  const idsToResolve = [...new Set(otherUserIdByChannel.values())]

  let pseudoById = new Map<number, string>()
  let avatarUrlById = new Map<number, string | null>()
  try {
    const res = await fetch(`${env.usersServiceUrl}/users/batch?ids=${idsToResolve.join(',')}`)
    if (res.ok) {
      const usersList = (await res.json()) as { id: number; pseudo: string; avatarUrl?: string | null }[]
      pseudoById = new Map(usersList.map((u) => [u.id, u.pseudo]))
      avatarUrlById = new Map(usersList.map((u) => [u.id, u.avatarUrl ?? null]))
    }
  } catch {
    // users_service unreachable: leave name as-is (null), frontend falls back to a placeholder
  }

  return rows.map((c) => {
    if (c.type !== 'discussion')
      return c
    const otherUserId = otherUserIdByChannel.get(c.id)
    const pseudo = otherUserId !== undefined ? pseudoById.get(otherUserId) : undefined
    const avatarUrl = otherUserId !== undefined ? avatarUrlById.get(otherUserId) : undefined
    return {
      ...c,
      otherUserId,
      name: c.name === null && pseudo !== undefined ? pseudo : c.name,
      avatarUrl: c.avatarUrl ?? avatarUrl ?? null,
    }
  })
}

// Lists every channel the given user currently belongs to (their conversation list).
export async function listUserChannels(userId: number) {
  // membership itself is the visibility rule: a discussion is only listed while
  // the caller has a channel_members row for it (see leaveChannel/ensureMembership)
  const rows = await db
    .select({
      id: channels.id,
      name: channels.name,
      type: channels.type,
      description: channels.description,
      avatarUrl: channels.avatarUrl,
      writeMode: channels.writeMode,
      createdAt: channels.createdAt,
    })
    .from(channels)
    .innerJoin(channelMembers, eq(channelMembers.channelId, channels.id))
    .where(eq(channelMembers.userId, userId))

  return resolveDiscussionNames(rows, userId)
}

// Returns the id of the most recent message in a channel (used to compute unread state).
export async function getLastMessageId(channelId: number): Promise<number | null> {
  const [row] = await db
    .select({ id: messages.id })
    .from(messages)
    .where(eq(messages.channelId, channelId))
    .orderBy(desc(messages.id))
    .limit(1)
  return row?.id ?? null
}

// Returns the last message id this specific user has read in this channel.
export async function getLastReadMessageId(channelId: number, userId: number): Promise<number | null> {
  const [row] = await db
    .select({ lastReadMessageId: channelMembers.lastReadMessageId })
    .from(channelMembers)
    .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
    .limit(1)
  return row?.lastReadMessageId ?? null
}

// Marks a channel as read for a user by setting lastReadMessageId to the current
// latest message. Returns false if the user isn't a member (nothing to mark).
export async function markChannelRead(channelId: number, userId: number): Promise<boolean> {
  if (!(await isChannelMember(channelId, userId)))
    return false

  await db
    .update(channelMembers)
    .set({ lastReadMessageId: await getLastMessageId(channelId) ?? 0 })
    .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
  return true
}

// Removes a user's membership row for a channel (used both for "leave" and as part
// of the kick flow). Does not delete the channel itself.
export async function leaveChannel(channelId: number, userId: number): Promise<void> {
  await db
    .delete(channelMembers)
    .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
}

// Adds a membership row for a user if they don't already have one. Used to re-add
// a discussion participant once they receive a message, after having left it before.
// Returns true if a row was actually created, false if they were already a member.
export async function ensureMembership(channelId: number, userId: number): Promise<boolean> {
  if (await isChannelMember(channelId, userId))
    return false

  await db.insert(channelMembers).values({ channelId, userId })
  return true
}

// For a discussion channel, returns the id of the participant who isn't userId.
export async function getOtherDiscussionParticipant(channelId: number, userId: number): Promise<number | null> {
  const [pair] = await db
    .select({ userMinId: discussionPairs.userMinId, userMaxId: discussionPairs.userMaxId })
    .from(discussionPairs)
    .where(eq(discussionPairs.channelId, channelId))
    .limit(1)

  if (!pair)
    return null
  return pair.userMinId === userId ? pair.userMaxId : pair.userMinId
}

// Fetches a single channel's raw data (no discussion name/avatar resolution).
export async function channelInfo(channelId: number) {
  const [row] = await db
    .select({
      id: channels.id,
      name: channels.name,
      type: channels.type,
      description: channels.description,
      avatarUrl: channels.avatarUrl,
      writeMode: channels.writeMode,
      createdAt: channels.createdAt,
    })
    .from(channels)
    .where(eq(channels.id, channelId))
    .limit(1)

  return row
}

export async function isChannelMember(channelId: number, userId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: channelMembers.id })
    .from(channelMembers)
    .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
    .limit(1)

  if (row == undefined)
    return false
  return true
}

// Returns each member's id and their local role in the channel (moderator/member).
export async function listChannelMembers(channelId: number) {
  const rows = await db
    .select({ userId: channelMembers.userId, role: channelMembers.role })
    .from(channelMembers)
    .where(eq(channelMembers.channelId, channelId))

  return rows
}

// Bulk-inserts membership rows for a list of users, all with the same role.
export async function addChannelMembers(channelId: number, userIds: number[], role: 'moderator' | 'member'): Promise<void> {
  if (userIds.length === 0)
    return

  await db.insert(channelMembers).values(
    userIds.map((userId) => ({ channelId, userId, role })),
  )
}

// Creates a new channel. Behavior differs by type:
// group/channel: creator becomes 'moderator', everyone else becomes 'member'.
//   'channel' type additionally defaults to moderators-only write mode.
// discussion: only the creator gets a membership row up front (the other participant
//   is added later, once they actually receive a message — see messages.controller.ts).
//   Uses a transaction because it writes to two tables (channels + discussionPairs)
//   that must stay consistent.
export async function createChannel(name: string | undefined, memberIds: number[], type: string, description: string | undefined, creatorId: number): Promise<{ channel: ChannelRow; reused: boolean }> {
  if (type !== 'discussion') {
    const writeMode = type === 'channel' ? 'moderators_only' : 'everyone'
    const result = await db.insert(channels).values({ name, type, description, writeMode })
    const channelId = Number(result[0].insertId)

    // Creator becomes moderator
    await addChannelMembers(channelId, [creatorId], 'moderator')

    // Others become members
    const otherMembers = memberIds.filter((id) => id !== creatorId)
    await addChannelMembers(channelId, otherMembers, 'member')

    return { channel: (await channelInfo(channelId))!, reused: false }
  }

  // a discussion only gets a channel_members row for its creator up front;
  // the other participant is added later, when they actually receive a message (see messages.controller.ts)
  const [userAId, userBId] = memberIds
  const userMinId = Math.min(userAId, userBId)
  const userMaxId = Math.max(userAId, userBId)

  try {
    const channelId = await db.transaction(async (tx) => {
      const result = await tx.insert(channels).values({ name, type, description })
      const newChannelId = Number(result[0].insertId)
      await tx.insert(channelMembers).values({ channelId: newChannelId, userId: creatorId })
      await tx.insert(discussionPairs).values({ channelId: newChannelId, userMinId, userMaxId })
      return newChannelId
    })
    return { channel: (await channelInfo(channelId))!, reused: false }
  } catch (err) {
    const code = (err as { code?: string; cause?: { code?: string } }).code
      ?? (err as { cause?: { code?: string } }).cause?.code
    if (code !== 'ER_DUP_ENTRY')
      throw err

    // the pair already has a discussion: reuse it instead of creating a duplicate,
    // and make sure the caller has a membership row again in case they'd left it before
    const [pair] = await db
      .select({ channelId: discussionPairs.channelId })
      .from(discussionPairs)
      .where(and(eq(discussionPairs.userMinId, userMinId), eq(discussionPairs.userMaxId, userMaxId)))
      .limit(1)

    await ensureMembership(pair.channelId, creatorId)
    return { channel: (await channelInfo(pair.channelId))!, reused: true }
  }
}

// Permanently deletes a channel, including its avatar file on disk (if any),
// to avoid leaving orphaned files behind.
export async function deleteChannel(channelId: number): Promise<void> {
  const channel = await channelInfo(channelId)
  if (channel?.avatarUrl) {
    const filename = channel.avatarUrl.replace('/chat/avatars/', '')
    const filepath = path.join(env.uploadsDir, 'avatars', filename)
    await unlink(filepath).catch(() => {})
  }
  await db.delete(channels).where(eq(channels.id, channelId))
}

export async function updateChannelAvatar(channelId: number, avatarUrl: string) {
  await db.update(channels).set({ avatarUrl }).where(eq(channels.id, channelId))
  return channelInfo(channelId)
}

// Clears a channel's avatar and deletes the old file from disk, if one was set.
export async function deleteChannelAvatar(channelId: number) {
  const channel = await channelInfo(channelId)
  if (channel?.avatarUrl) {
    const filename = channel.avatarUrl.replace('/chat/avatars/', '')
    const filepath = path.join(env.uploadsDir, 'avatars', filename)
    await unlink(filepath).catch(() => {})
  }
  await db.update(channels).set({ avatarUrl: null }).where(eq(channels.id, channelId))
  return channelInfo(channelId)
}

export async function removeChannelMember(channelId: number, userId: number): Promise<void> {
  await db.delete(channelMembers).where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
}

// Updates name and/or description; only touches the fields that were actually provided.
export async function updateChannel(channelId: number, data: { name?: string; description?: string }) {
  const toUpdate: Partial<{ name: string; description: string }> = {}
  if (data.name !== undefined) toUpdate.name = data.name
  if (data.description !== undefined) toUpdate.description = data.description
  if (Object.keys(toUpdate).length > 0) {
    await db.update(channels).set(toUpdate).where(eq(channels.id, channelId))
  }
  return channelInfo(channelId)
}

// Lists every channel in the system (for the "discover" view), flagging which ones
// the given user is already a member of.
export async function listAllChannels(userId: number) {
  const allChannels = await db
    .select({
      id: channels.id,
      name: channels.name,
      createdAt: channels.createdAt,
    })
    .from(channels)

    const myChannelIds = new Set(
      (await db.select({ channelId: channelMembers.channelId })
        .from(channelMembers)
        .where(eq(channelMembers.userId, userId))
      ).map((r) => r.channelId)
    )

    return allChannels.map((c) => ({ ...c, isMember: myChannelIds.has(c.id) }))
}

export async function updateMemberRole(channelId: number, userId: number, role: 'moderator' | 'member') {
  await db.update(channelMembers)
    .set({ role })
    .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
}

export async function updateWriteMode(channelId: number, writeMode: 'everyone' | 'moderators_only') {
  await db.update(channels).set({ writeMode }).where(eq(channels.id, channelId))
  return channelInfo(channelId)
}

// Returns a user's local role in a channel, or null if they aren't a member.
export async function getMemberRole(channelId: number, userId: number): Promise<'moderator' | 'member' | null> {
  const [row] = await db
    .select({ role: channelMembers.role })
    .from(channelMembers)
    .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
    .limit(1)

  return row?.role ?? null
}

export async function countChannelMembers(channelId: number): Promise<number> {
  const rows = await db
    .select({ id: channelMembers.id })
    .from(channelMembers)
    .where(eq(channelMembers.channelId, channelId))

  return rows.length
}