import { eq, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { files } from '../../db/schema.js'
import { env } from '../../config/env.js'

export const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export function isAllowedFile(mimeType: string, size: number): { valid: boolean; reason?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, reason: 'File type not allowed' }
  }
  if (size > env.maxFileSize) {
    return { valid: false, reason: 'File too large' }
  }
  return { valid: true }
}

export async function saveFileRecord(data: {
  channelId: number
  uploaderId: number
  originalName: string
  storedName: string
  mimeType: string
  size: number
}) {
  const [result] = await db.insert(files).values(data)
  return getFileById(Number(result.insertId))
}

export async function getFileById(id: number) {
  const [row] = await db.select().from(files).where(eq(files.id, id)).limit(1)
  return row
}

export async function getFilesByIds(ids: number[]) {
  if (ids.length === 0) return []
  return db.select().from(files).where(inArray(files.id, ids))
}

export async function deleteFileRecord(id: number) {
  await db.delete(files).where(eq(files.id, id))
}