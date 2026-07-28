import { randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { apiKeys } from '../../db/schema.js'
import { env } from '../../config/env.js'
import { hashApiKey } from '../vault/hash.js'


// TODO delete this function before push ?
export async function getApiKeysByOwnerId(owner_id: number) {
  const rows = await db
    .select({ id: apiKeys.id, owner_id: apiKeys.owner_id, api_key_hash: apiKeys.api_key_hash, expires_at: apiKeys.expires_at })
    .from(apiKeys)
    .where(eq(apiKeys.owner_id, owner_id))
    .limit(1)
  return rows[0]
}

async function generateApiKey() {
  const apiKeyCreated = randomBytes(32).toString('hex')
  const apiKeyHash = await hashApiKey(apiKeyCreated);

  return { apiKeyCreated, apiKeyHash }
}

export async function createApiKeys(owner_id: number) {
  const { apiKeyCreated, apiKeyHash } = await generateApiKey()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + env.apiKeyExpirationDays)

  await deleteApiKeys(owner_id);

  // TODO dev only, remove api_key before push api_key
  const [result] = await db
    .insert(apiKeys)
    .values({ owner_id, api_key_hash: apiKeyHash, api_key: apiKeyCreated, expires_at: expiresAt })

  return { id: result.insertId, owner_id, apiKeyCreated }
}

export async function updateApiKeys(owner_id: number) {
  const { apiKeyCreated, apiKeyHash } = await generateApiKey()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + env.apiKeyExpirationDays)

  // TODO dev only, remove before push api_key
  const [result] = await db
    .update(apiKeys)
    .set({ api_key_hash: apiKeyHash, api_key: apiKeyCreated, expires_at: expiresAt })
    .where(eq(apiKeys.owner_id, owner_id))

  if (result.affectedRows === 0)
    return null

  return { owner_id, apiKeyCreated }
}

export async function deleteApiKeys(owner_id: number) {
  const [result] = await db.delete(apiKeys).where(eq(apiKeys.owner_id, owner_id))
  return result.affectedRows > 0
}

export async function verifyApiKey(apiKey: string): Promise<{ owner_id: number } | null> {
  const apiKeyHash = await hashApiKey(apiKey)

  const rows = await db
    .select({ owner_id: apiKeys.owner_id, expires_at: apiKeys.expires_at })
    .from(apiKeys)
    .where(eq(apiKeys.api_key_hash, apiKeyHash))
    .limit(1)

  if (!rows[0])
    return null

  if (rows[0].expires_at < new Date())
    return null

  return { owner_id: rows[0].owner_id }
}
