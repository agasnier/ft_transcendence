import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from './users.service.js'

export async function listUsersController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const users = await getAllUsers()
  await reply.send(users)
}

export async function getUserController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
  const user = await getUserById(Number(request.params.id))
  await reply.send(user)
}

export async function createUserController(request: FastifyRequest<{ Body: { pseudo: string; password: string } }>, reply: FastifyReply): Promise<void> {
  const { pseudo, password } = request.body
  const user = await createUser(pseudo, password)
  await reply.status(201).send(user)
}

export async function updateUserController(request: FastifyRequest<{ Params: { id: string }; Body: { pseudo?: string; password?: string } }>, reply: FastifyReply): Promise<void> {
  const user = await updateUser(Number(request.params.id), request.body)
  await reply.send(user)
}

export async function deleteUserController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
  await deleteUser(Number(request.params.id))
  await reply.send({ message: 'User deleted' })
}
