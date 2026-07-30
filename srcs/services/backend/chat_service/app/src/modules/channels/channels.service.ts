import { and, eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { channels, channelMembers } from '../../db/schema.js'

export async function listUserChannels(userId: number) {
  return db
    .select({
      id: channels.id,
      name: channels.name,
      type: channels.type,
      createdAt: channels.createdAt,
    })
    .from(channels)
    .innerJoin(channelMembers, eq(channelMembers.channelId, channels.id))
    .where(eq(channelMembers.userId, userId))
}

export async function channelInfo(channelId: number) {
  const [row] = await db
    .select({
      id: channels.id,
      name: channels.name,
      type: channels.type,
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

export async function createChannel(name: string | undefined, creatorId: number, type: string, memberIds: number[] = []) {
  const result = await db.insert(channels).values({ name, type })
  const channelId = Number(result[0].insertId)

  // Creator become moderator
  await addChannelMembers(channelId, [creatorId], 'moderator')

  // Others become members
  const otherMembers = memberIds.filter((id) => id !== creatorId)
  await addChannelMembers(channelId, otherMembers,  'member')

  return channelInfo(channelId)
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