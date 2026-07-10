import { eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { apiKeys } from '../../db/schema.js'
import { stringify } from 'node:querystring'
import { StringAsNumber } from 'fastify/types/utils.js'


// TODO delete this function before push ?
export async function getAllApiKeys() {
  return await db
    .select({ id: apiKeys.id, owner_id: apiKeys.owner_id, api_key_hash: apiKeys.api_key_hash, created_at: apiKeys.created_at })
    .from(apiKeys)
}

// TODO delete this function before push ?
export async function getApiKeysByOwnerId(owner_id: number) {
  const rows = await db
    .select({ id: apiKeys.id, owner_id: apiKeys.owner_id, api_key_hash: apiKeys.api_key_hash, created_at: apiKeys.created_at })
    .from(apiKeys)
    .where(eq(apiKeys.owner_id, owner_id))
    .limit(1)
  return rows[0]
}

function generateApiKey() {

  // TODO create an apiKeys
  const apiKeyCreated = "ApIkEyS"

  // TODO hash the apiKeys when pepper vault plug in
  const apiKeyHash = "HaSh_ApIkEyS"

  return { apiKeyCreated, apiKeyHash }
}

export async function createApiKeys(owner_id: number) {
  const { apiKeyCreated, apiKeyHash } = generateApiKey()

  const [result] = await db
    .insert(apiKeys)
    .values({ owner_id, api_key_hash: apiKeyHash })

  return { id: result.insertId, owner_id, apiKeyCreated }
}

export async function updateApiKeys(owner_id: number) {
  const { apiKeyCreated, apiKeyHash } = generateApiKey()

  const [result] = await db
    .update(apiKeys)
    .set({ api_key_hash: apiKeyHash })
    .where(eq(apiKeys.owner_id, owner_id))

  if (result.affectedRows === 0)
    return null

  return { owner_id, apiKeyCreated }
}

export async function deleteApiKeys(owner_id: number) {
  const [result] = await db.delete(apiKeys).where(eq(apiKeys.owner_id, owner_id))
  return result.affectedRows > 0
}
