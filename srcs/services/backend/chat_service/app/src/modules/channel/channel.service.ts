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

export async function createChannel(name: string, userId: number): Promise<void> {
  const result = await db.insert(channels).values({ name })
  const channelId = Number(result[0].insertId)

  await db.insert(channelMembers).values({
    channelId,
    userId,
  })
}

export async function deleteChannel(channelId: number): Promise<void> {
  await db.delete(channels).where(eq(channels.id, channelId))
}
