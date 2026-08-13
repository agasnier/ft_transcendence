import { and, eq, inArray } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { channels, channelMembers, discussionPairs } from '../../db/schema.js'
import { env } from '../../config/env.js'

type ChannelRow = {
  id: number
  name: string | null
  type: string
  description: string | null
  createdAt: Date
}

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

  const otherUserIdByChannel = new Map(
    pairs.map((p) => [p.channelId, p.userMinId === userId ? p.userMaxId : p.userMinId]),
  )
  const idsToResolve = [...new Set(otherUserIdByChannel.values())]

  let pseudoById = new Map<number, string>()
  try {
    const res = await fetch(`${env.usersServiceUrl}/users/batch?ids=${idsToResolve.join(',')}`)
    if (res.ok) {
      const usersList = (await res.json()) as { id: number; pseudo: string }[]
      pseudoById = new Map(usersList.map((u) => [u.id, u.pseudo]))
    }
  } catch {
    // users_service unreachable: leave name as-is (null), frontend falls back to a placeholder
  }

  return rows.map((c) => {
    if (c.type !== 'discussion' || c.name !== null)
      return c
    const otherUserId = otherUserIdByChannel.get(c.id)
    const pseudo = otherUserId !== undefined ? pseudoById.get(otherUserId) : undefined
    return pseudo !== undefined ? { ...c, name: pseudo } : c
  })
}

export async function listUserChannels(userId: number) {
  // membership itself is the visibility rule: a discussion is only listed while
  // the caller has a channel_members row for it (see leaveChannel/ensureMembership)
  const rows = await db
    .select({
      id: channels.id,
      name: channels.name,
      type: channels.type,
      description: channels.description,
      createdAt: channels.createdAt,
    })
    .from(channels)
    .innerJoin(channelMembers, eq(channelMembers.channelId, channels.id))
    .where(eq(channelMembers.userId, userId))

  return resolveDiscussionNames(rows, userId)
}

export async function leaveChannel(channelId: number, userId: number): Promise<void> {
  await db
    .delete(channelMembers)
    .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
}

export async function ensureMembership(channelId: number, userId: number): Promise<boolean> {
  if (await isChannelMember(channelId, userId))
    return false

  await db.insert(channelMembers).values({ channelId, userId })
  return true
}

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

export async function channelInfo(channelId: number) {
  const [row] = await db
    .select({
      id: channels.id,
      name: channels.name,
      type: channels.type,
      description: channels.description,
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

export async function listChannelMembers(channelId: number) {
  const rows = await db
    .select({ userId: channelMembers.userId, role: channelMembers.role })
    .from(channelMembers)
    .where(eq(channelMembers.channelId, channelId))

  return rows
}

export async function addChannelMembers(channelId: number, userIds: number[], role: 'moderator' | 'member'): Promise<void> {
  if (userIds.length === 0)
    return

  await db.insert(channelMembers).values(
    userIds.map((userId) => ({ channelId, userId, role })),
  )
}

export async function createChannel(name: string | undefined, memberIds: number[], type: string, description: string | undefined, creatorId: number): Promise<{ channel: ChannelRow; reused: boolean }> {
  if (type !== 'discussion') {
    const result = await db.insert(channels).values({ name, type, description })
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

export async function deleteChannel(channelId: number): Promise<void> {
  await db.delete(channels).where(eq(channels.id, channelId))
}

export async function removeChannelMember(channelId: number, userId: number): Promise<void> {
  await db.delete(channelMembers).where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
}

export async function updateChannel(channelId: number, name: string) {
  await db.update(channels).set({ name }).where(eq(channels.id, channelId))
  return channelInfo(channelId)
}

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