import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from './users.service.js'
import { createCookie } from '../auth/auth.service.js'

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
  request: FastifyRequest<{ Body: { pseudo: string; password: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const { pseudo, password } = request.body
    const user = await createUser(pseudo, password)

    // auto-login on signup: issue tokens + cookies for the new user
    await createCookie(reply, { id: user.id, pseudo: user.pseudo })

    await reply.status(201).send(user)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function updateUserController(
  request: FastifyRequest<{ Params: { id: string }; Body: { pseudo?: string; password?: string } }>, reply: FastifyReply): Promise<void> {
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