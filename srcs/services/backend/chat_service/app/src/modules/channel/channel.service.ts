import { and, eq } from 'drizzle-orm'

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

export async function isUserInChannel(channelId: number, userId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: channelMembers.id })
    .from(channelMembers)
    .where(
      and(
        eq(channelMembers.channelId, channelId),
        eq(channelMembers.userId, userId),
      ),
    )
    .limit(1)

  return row !== undefined
}
