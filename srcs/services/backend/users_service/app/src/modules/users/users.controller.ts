import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from './users.service.js'
import { pipeline } from 'stream/promises'
import { createWriteStream } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { updateUserProfile, getUserProfile, updateAvatar } from './users.service.js'


export async function listUsersController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const users = await getAllUsers()
    await reply.send(users)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function getUserController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const id = Number(request.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      await reply.status(400).send({ message: 'Invalid id' })
      return
    }

    const user = await getUserById(id)
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

export async function createUserController(
  request: FastifyRequest<{ Body: { mail: string; pseudo: string; password: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const { mail, pseudo, password } = request.body
    const user = await createUser(mail, pseudo, password)

    await reply.status(201).send(user)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function updateUserController(
  request: FastifyRequest<{ Params: { id: string }; Body: { mail?: string; pseudo?: string; password?: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const id = Number(request.params.id)
    const user = await updateUser(id, request.body)
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

export async function deleteUserController(
  request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const id = Number(request.params.id)
    const deleted = await deleteUser(id)
    if (!deleted) {
      await reply.status(404).send({ message: 'User not found' })
      return
    }
    await reply.status(200).send({ message: 'User deleted' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function updateProfileController(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user) {
		await reply.code(401).send({ message: 'Not authentificated' })
		return
	}
  const body = req.body as { displayName?: string; bio?: string }
  const updated = await updateUserProfile(req.user.id, body)
  return reply.send(updated);
}

export async function getUserProfileController(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id:string }
  const user = await getUserProfile(Number(id))
  if (!user) {
    await reply.code(404).send({ message: 'User not found' })
    return
  }
  return reply.send(user)
}

export async function uploadAvatarController(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user) {
		await reply.code(401).send({ message: 'Not authentificated' })
		return
	}
  const data = await req.file();
  if (!data) {
    await reply.code(400).send({ message: 'No file provided' })
    return
  }
  const allowed = ['image/jpeg', 'image/png', 'image.webp']
  if (!allowed.includes(data.mimetype)) {
    await reply.code(400).send({ message: 'Invalid file type' })
    return
  }
  const filename = `${randomUUID()}${path.extname(data.filename)}`
  const filepath = path.join('/app/uploads/avatars', filename)
  await pipeline(data.file, createWriteStream(filepath))
  const avatarUrl = '/avatars/${filename}'
  await updateAvatar(req.user.id, avatarUrl)
  return reply.send({ avatarUrl })
}