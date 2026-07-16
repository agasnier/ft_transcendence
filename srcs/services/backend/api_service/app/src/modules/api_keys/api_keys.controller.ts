import type { FastifyReply, FastifyRequest } from 'fastify'
import { getApiKeysByOwnerId, createApiKeys, updateApiKeys, deleteApiKeys, verifyApiKey } from './api_keys.service.js'
import { getUserById } from '../users/users.service.js'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'

// hooks
export async function userAuthHook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const accessToken = request.cookies.access_token
  if (!accessToken) {
    await reply.status(401).send({ message: 'Not authenticated' })
    return
  }

  let user: { id: number; pseudo: string }
  try {
    user = jwt.verify(accessToken, env.jwtPublicKey, { algorithms: ['ES256'] }) as { id: number; pseudo: string }
  } catch {
    await reply.status(401).send({ message: 'Not authenticated' })
    return
  }

  request.user = user
}

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
export async function getApiKeysController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const user = await getApiKeysByOwnerId(request.user!.id)
    if (!user) {
      await reply.status(404).send({ message: 'No API key found' })
      return
    }

    await reply.send(user)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function createApiKeysController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const apiKey = await createApiKeys(request.user!.id)
    await reply.status(201).send(apiKey)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function updateApiKeysController(
  request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const apiKey = await updateApiKeys(request.user!.id)
    if (!apiKey) {
      await reply.status(404).send({ message: 'No API key found' })
      return
    }

    await reply.send(apiKey)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function deleteApiKeysController(
  request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const deleted = await deleteApiKeys(request.user!.id)
    if (!deleted) {
      await reply.status(404).send({ message: 'No API key found' })
      return
    }

    await reply.status(200).send({ message: 'Api key deleted' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}


