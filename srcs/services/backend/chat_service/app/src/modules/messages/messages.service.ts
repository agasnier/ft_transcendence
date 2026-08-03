import { asc, count, eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { messages } from '../../db/schema.js'
import { env } from '../../config/env.js'

type MessageRow = {
  id: number
  channelId: number
  senderId: number
  content: string
  createdAt: Date
}

async function resolveSenderPseudos(rows: MessageRow[]): Promise<(MessageRow & { senderPseudo: string | null })[]> {
  const senderIds = [...new Set(rows.map((row) => row.senderId))]
  if (senderIds.length === 0)
    return []

  let pseudoById = new Map<number, string>()
  try {
    const res = await fetch(`${env.usersServiceUrl}/users/batch?ids=${senderIds.join(',')}`)
    if (res.ok) {
      const usersList = (await res.json()) as { id: number; pseudo: string }[]
      pseudoById = new Map(usersList.map((u) => [u.id, u.pseudo]))
    }
  } catch {
    // users_service unreachable: leave pseudo null, frontend falls back to a placeholder
  }

  return rows.map((row) => ({ ...row, senderPseudo: pseudoById.get(row.senderId) ?? null }))
}

export async function countMessages(channelId: number): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(messages)
    .where(eq(messages.channelId, channelId))

  return row.count
}

export async function listMessages(channelId: number) {
  const rows = await db
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

  return resolveSenderPseudos(rows)
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

  const [resolved] = await resolveSenderPseudos([row])
  return resolved
}
