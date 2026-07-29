import { asc, eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { messages } from '../../db/schema.js'

export async function listMessages(channelId: number) {
  return db
    .select({
      id: messages.id,
      channelId: messages.channelId,
      senderId: messages.senderId,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.channelId, channelId))
    .orderBy(asc(messages.createdAt))
}

export async function createMessage(channelId: number, senderId: number, content: string) {
  const result = await db.insert(messages).values({ channelId, senderId, content })
  const messageId = Number(result[0].insertId)

  const [row] = await db
    .select({
      id: messages.id,
      channelId: messages.channelId,
      senderId: messages.senderId,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.id, messageId))
    .limit(1)

  return row
}
