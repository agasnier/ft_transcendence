import { randomBytes, createHmac } from 'node:crypto'
import { eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { apiKeys } from '../../db/schema.js'
import { env } from '../../config/env.js'


// TODO delete this function before push ?
export async function getAllApiKeys() {
  return await db
    .select({ id: apiKeys.id, owner_id: apiKeys.owner_id, api_key_hash: apiKeys.api_key_hash, expires_at: apiKeys.expires_at })
    .from(apiKeys)
}

// TODO delete this function before push ?
export async function getApiKeysByOwnerId(owner_id: number) {
  const rows = await db
    .select({ id: apiKeys.id, owner_id: apiKeys.owner_id, api_key_hash: apiKeys.api_key_hash, expires_at: apiKeys.expires_at })
    .from(apiKeys)
    .where(eq(apiKeys.owner_id, owner_id))
    .limit(1)
  return rows[0]
}

function generateApiKey() {
  const apiKeyCreated = randomBytes(32).toString('hex')
  const apiKeyHash = createHmac('sha256', env.pepper).update(apiKeyCreated).digest('hex')

  return { apiKeyCreated, apiKeyHash }
}

export async function createApiKeys(owner_id: number) {
  const { apiKeyCreated, apiKeyHash } = generateApiKey()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + env.apiKeyExpirationDays)

  // TODO dev only, remove before push api_key
  const [result] = await db
    .insert(apiKeys)
    .values({ owner_id, api_key_hash: apiKeyHash, api_key: apiKeyCreated, expires_at: expiresAt })

  return { id: result.insertId, owner_id, apiKeyCreated }
}

export async function updateApiKeys(owner_id: number) {
  const { apiKeyCreated, apiKeyHash } = generateApiKey()
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
