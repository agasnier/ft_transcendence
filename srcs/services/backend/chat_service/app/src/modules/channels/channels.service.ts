import { eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { channels, channelMembers } from '../../db/schema.js'

export async function listUserChannels(userId: number) {
  return db
    .select({
      id: channels.id,
      name: channels.name,
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
      createdAt: channels.createdAt,
    })
    .from(channels)
    .where(eq(channels.id, channelId))
    .limit(1)

  return row
}

export async function addChannelMembers(channelId: number, userIds: number[]): Promise<void> {
  if (userIds.length === 0)
    return

  await db.insert(channelMembers).values(
    userIds.map((userId) => ({ channelId, userId })),
  )
}

export async function createChannel(name: string | undefined, memberIds: number[]) {
  const result = await db.insert(channels).values({ name })
  const channelId = Number(result[0].insertId)

  await addChannelMembers(channelId, memberIds)

  return channelInfo(channelId)
}

export async function deleteChannel(channelId: number): Promise<void> {
  await db.delete(channels).where(eq(channels.id, channelId))
}
