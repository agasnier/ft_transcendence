import { asc, eq, inArray } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { messages } from '../../db/schema.js'
import { env } from '../../config/env.js'
import { getFilesByIds } from '../files/files.service.js'

type MessageRow = {
  id: number
  channelId: number
  senderId: number
  content: string
  createdAt: Date
  type: 'user' | 'system'
  fileId: number | null
}

type FileInfo = {
  id: number
  originalName: string
  mimeType: string
  size: number
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

async function resolveFiles<T extends { fileId: number | null }>(rows: T[]): Promise<(T & { file: FileInfo | null })[]> {
  const fileIds = [...new Set(rows.filter((r) => r.fileId !== null).map((r) => r.fileId as number))]
  if (fileIds.length === 0)
    return rows.map((r) => ({ ...r, file: null }))

  const files = await getFilesByIds(fileIds)
  const fileById = new Map(files.map((f) => [f.id, { id: f.id, originalName: f.originalName, mimeType: f.mimeType, size: f.size }]))

  return rows.map((r) => ({ ...r, file: r.fileId !== null ? fileById.get(r.fileId) ?? null : null }))
}

export async function listMessages(channelId: number) {
  const rows = await db
    .select({
      id: messages.id,
      channelId: messages.channelId,
      senderId: messages.senderId,
      content: messages.content,
      createdAt: messages.createdAt,
      type: messages.type,
      fileId: messages.fileId,
    })
    .from(messages)
    .where(eq(messages.channelId, channelId))
    .orderBy(asc(messages.createdAt))

  const withPseudos = await resolveSenderPseudos(rows)
  return resolveFiles(withPseudos)
}

export async function createMessage(channelId: number, senderId: number, content: string, type: 'user' | 'system' = 'user', fileId: number | null = null) {
  const result = await db.insert(messages).values({ channelId, senderId, content, type, fileId })
  const messageId = Number(result[0].insertId)

  const [row] = await db
    .select({
      id: messages.id,
      channelId: messages.channelId,
      senderId: messages.senderId,
      content: messages.content,
      createdAt: messages.createdAt,
      type: messages.type,
      fileId: messages.fileId,
    })
    .from(messages)
    .where(eq(messages.id, messageId))
    .limit(1)

  const [withPseudo] = await resolveSenderPseudos([row])
  const [resolved] = await resolveFiles([withPseudo])
  return resolved
}
