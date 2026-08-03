import { and, eq, inArray, ne } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { channels, channelMembers, messages, discussionPairs } from '../../db/schema.js'
import { env } from '../../config/env.js'

type ChannelRow = {
  id: number
  name: string | null
  type: string
  description: string | null
  creatorId: number | null
  createdAt: Date
}

type ChannelRowWithHidden = ChannelRow & { hiddenAt: Date | null }

async function hasMessages(channelIds: number[]): Promise<Set<number>> {
  if (channelIds.length === 0)
    return new Set()

  const rows = await db
    .select({ channelId: messages.channelId })
    .from(messages)
    .where(inArray(messages.channelId, channelIds))

  return new Set(rows.map((row) => row.channelId))
}

export async function resolveDiscussionNames(rows: ChannelRow[], userId: number): Promise<ChannelRow[]> {
  const discussionIds = rows.filter((c) => c.type === 'discussion').map((c) => c.id)
  if (discussionIds.length === 0)
    return rows

  const otherMembers = await db
    .select({ channelId: channelMembers.channelId, userId: channelMembers.userId })
    .from(channelMembers)
    .where(and(
      inArray(channelMembers.channelId, discussionIds),
      ne(channelMembers.userId, userId),
    ))

  const otherUserIdByChannel = new Map(otherMembers.map((m) => [m.channelId, m.userId]))
  const idsToResolve = [...new Set(otherMembers.map((m) => m.userId))]

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
  const rows: ChannelRowWithHidden[] = await db
    .select({
      id: channels.id,
      name: channels.name,
      type: channels.type,
      description: channels.description,
      creatorId: channels.creatorId,
      createdAt: channels.createdAt,
      hiddenAt: channelMembers.hiddenAt,
    })
    .from(channels)
    .innerJoin(channelMembers, eq(channelMembers.channelId, channels.id))
    .where(eq(channelMembers.userId, userId))

  const discussionIds = rows.filter((c) => c.type === 'discussion').map((c) => c.id)
  const revealedChannelIds = await hasMessages(discussionIds)

  const visibleRows = rows.filter((c) => {
    if (c.type !== 'discussion')
      return true
    if (c.hiddenAt !== null)
      return false
    return c.creatorId === userId || revealedChannelIds.has(c.id)
  })

  return resolveDiscussionNames(visibleRows, userId)
}

export async function hideDiscussionForUser(channelId: number, userId: number): Promise<void> {
  await db
    .update(channelMembers)
    .set({ hiddenAt: new Date() })
    .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
}

export async function revealDiscussionForMember(channelId: number, userId: number): Promise<boolean> {
  const [row] = await db
    .select({ hiddenAt: channelMembers.hiddenAt })
    .from(channelMembers)
    .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
    .limit(1)

  if (!row || row.hiddenAt === null)
    return false

  await db
    .update(channelMembers)
    .set({ hiddenAt: null })
    .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))

  return true
}

export async function channelInfo(channelId: number) {
  const [row] = await db
    .select({
      id: channels.id,
      name: channels.name,
      type: channels.type,
      description: channels.description,
      creatorId: channels.creatorId,
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

export async function listChannelMembers(channelId: number): Promise<number[]> {
  const rows = await db
    .select({ userId: channelMembers.userId })
    .from(channelMembers)
    .where(eq(channelMembers.channelId, channelId))

  return rows.map((row) => row.userId)
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
    const result = await db.insert(channels).values({ name, type, description, creatorId })
    const channelId = Number(result[0].insertId)

    // Creator becomes moderator
    await addChannelMembers(channelId, [creatorId], 'moderator')

    // Others become members
    const otherMembers = memberIds.filter((id) => id !== creatorId)
    await addChannelMembers(channelId, otherMembers, 'member')

    return { channel: (await channelInfo(channelId))!, reused: false }
  }

  const [userAId, userBId] = memberIds
  const userMinId = Math.min(userAId, userBId)
  const userMaxId = Math.max(userAId, userBId)

  try {
    const channelId = await db.transaction(async (tx) => {
      const result = await tx.insert(channels).values({ name, type, description, creatorId })
      const newChannelId = Number(result[0].insertId)
      await tx.insert(channelMembers).values(memberIds.map((userId) => ({ channelId: newChannelId, userId })))
      await tx.insert(discussionPairs).values({ channelId: newChannelId, userMinId, userMaxId })
      return newChannelId
    })
    return { channel: (await channelInfo(channelId))!, reused: false }
  } catch (err) {
    const code = (err as { code?: string; cause?: { code?: string } }).code
      ?? (err as { cause?: { code?: string } }).cause?.code
    if (code !== 'ER_DUP_ENTRY')
      throw err

    // the pair already has a discussion: reuse it instead of creating a duplicate
    const [pair] = await db
      .select({ channelId: discussionPairs.channelId })
      .from(discussionPairs)
      .where(and(eq(discussionPairs.userMinId, userMinId), eq(discussionPairs.userMaxId, userMaxId)))
      .limit(1)

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