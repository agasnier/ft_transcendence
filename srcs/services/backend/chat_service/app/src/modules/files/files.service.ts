import { eq, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { files } from '../../db/schema.js'
import { env } from '../../config/env.js'

// Whitelist of accepted file types for chat attachments: common image formats,
// PDFs, plain text, and Word documents.
export const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

// Validates a file's type and size before it's written to disk. Both checks are
// enforced here even though Fastify's multipart plugin also caps the size, so
// callers get a clear reason for rejection either way.
export function isAllowedFile(mimeType: string, size: number): { valid: boolean; reason?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, reason: 'File type not allowed' }
  }
  if (size > env.maxFileSize) {
    return { valid: false, reason: 'File too large' }
  }
  return { valid: true }
}

// Inserts a new file record (the actual bytes are already on disk by this point)
// and returns the freshly created row.
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

// Single fetch, used when only one file's metadata is needed
export async function getFileById(id: number) {
  const [row] = await db.select().from(files).where(eq(files.id, id)).limit(1)
  return row
}

// Batch fetch, used when resolving file metadata for a list of messages at once
// (avoids one query per message).
export async function getFilesByIds(ids: number[]) {
  if (ids.length === 0) return []
  return db.select().from(files).where(inArray(files.id, ids))
}

export async function deleteFileRecord(id: number) {
  await db.delete(files).where(eq(files.id, id))
}