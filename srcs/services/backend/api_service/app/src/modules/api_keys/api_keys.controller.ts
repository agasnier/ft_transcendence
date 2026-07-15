import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAllApiKeys, getApiKeysByOwnerId, createApiKeys, updateApiKeys, deleteApiKeys, verifyApiKey } from './api_keys.service.js'
import { getUserById } from '../users/users.service.js'

// hooks
export async function  apiKeyAuthHook (request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const apiKey = request.headers['x-api-key']

  if (typeof apiKey !== 'string') {
    return await reply.status(401).send( {message: 'Missing Api Key' })
  }

  const dbLine = await verifyApiKey(apiKey)
  if (!dbLine) {
    return await reply.status(401).send({ message: 'Invalid API key' })
  }

  const user = await getUserById(dbLine.owner_id)
  request.auth = { role: user.role, ownerId: user.id }
}

// controllers
export async function listApiKeysController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const apiKeys = await getAllApiKeys()
    await reply.send(apiKeys)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function getApiKeysController(request: FastifyRequest<{ Params: { owner_id: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const owner_id = Number(request.params.owner_id)
    if (!Number.isInteger(owner_id) || owner_id <= 0) {
      await reply.status(400).send({ message: 'Invalid owner_id' })
      return
    }

    const user = await getApiKeysByOwnerId(owner_id)
    if (!user) {
      await reply.status(404).send({ message: 'User not found' })
      return
    }

    await reply.send(user)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function createApiKeysController(
  request: FastifyRequest<{ Body: { owner_id: number } }>, reply: FastifyReply): Promise<void> {
  try {
    const { owner_id } = request.body
    const apiKey = await createApiKeys(owner_id)
    await reply.status(201).send(apiKey)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function updateApiKeysController(
  request: FastifyRequest<{ Params: { owner_id: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const owner_id = Number(request.params.owner_id)
    if (!Number.isInteger(owner_id) || owner_id <= 0) {
      await reply.status(400).send({ message: 'Invalid owner_id' })
      return
    }

    const apiKey = await updateApiKeys(owner_id)
    if (!apiKey) {
      await reply.status(404).send({ message: 'owner_id not found' })
      return
    }

    await reply.send(apiKey)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function deleteApiKeysController(
  request: FastifyRequest<{ Params: { owner_id: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const owner_id = Number(request.params.owner_id)
    if (!Number.isInteger(owner_id) || owner_id <= 0) {
      await reply.status(400).send({ message: 'Invalid owner_id' })
      return
    }

    const deleted = await deleteApiKeys(owner_id)
    if (!deleted) {
      await reply.status(404).send({ message: 'owner_id not found' })
      return
    }

    await reply.status(200).send({ message: 'Api key deleted' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}


