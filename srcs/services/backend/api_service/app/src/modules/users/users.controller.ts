import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAllUsers, getUserById } from './users.service.js'

export async function listUsers(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const users = await getAllUsers()
    await reply.send(users)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function getUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
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