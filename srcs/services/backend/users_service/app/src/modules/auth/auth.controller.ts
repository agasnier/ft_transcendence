import type { FastifyReply, FastifyRequest } from 'fastify'
import { verifyCredentials, createCookie, deleteRefreshToken, validateRefreshToken, getUserById, validateAccessToken } from './auth.service.js'

export async function loginController(
  request: FastifyRequest<{ Body: { pseudo: string; password: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const { pseudo, password } = request.body
    const user = await verifyCredentials(pseudo, password)
    if (!user) {
      await reply.status(401).send({ message: 'Invalid credentials' })
      return
    }

    await createCookie(reply, user)

    await reply.status(200).send({ message: 'Logged in' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function logoutController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const token = request.cookies.refresh_token
    if (token)
      await deleteRefreshToken(token)

    reply
      .clearCookie('access_token', { path: '/' })
      .clearCookie('refresh_token', { path: '/users' })

    await reply.status(200).send({ message: 'Logged out' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function sessionController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const accessToken = request.cookies.access_token
    if (accessToken) {
      const user = validateAccessToken(accessToken)
      if (user) {
        await reply.status(200).send(user)
        return
      }
    }

    const refreshToken = request.cookies.refresh_token
    if (!refreshToken) {
      await reply.status(401).send({ message: 'Not authenticated' })
      return
    }

    const stored = await validateRefreshToken(refreshToken)
    if (!stored) {
      await reply.status(401).send({ message: 'Not authenticated' })
      return
    }

    await deleteRefreshToken(refreshToken)

    const user = await getUserById(stored.owner_id)
    if (!user) {
      await reply.status(401).send({ message: 'Not authenticated' })
      return
    }

    await createCookie(reply, user)

    await reply.status(200).send(user)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}
