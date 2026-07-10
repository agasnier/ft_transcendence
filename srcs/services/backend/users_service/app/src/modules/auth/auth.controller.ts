import type { FastifyReply, FastifyRequest } from 'fastify'
import { verifyCredentials, createAccessToken, createRefreshToken, deleteRefreshToken, validateRefreshToken, getUserById } from './auth.service.js'

export async function loginController(
  request: FastifyRequest<{ Body: { pseudo: string; password: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const { pseudo, password } = request.body
    const user = await verifyCredentials(pseudo, password)
    if (!user) {
      await reply.status(401).send({ message: 'Invalid credentials' })
      return
    }

    const accessToken = createAccessToken(user)
    const refreshToken = await createRefreshToken(user.id)

    reply
      .setCookie('access_token', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' })
      .setCookie('refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/users' })

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

export async function refreshController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const oldToken = request.cookies.refresh_token
    if (!oldToken) {
      await reply.status(401).send({ message: 'Missing refresh token' })
      return
    }

    const stored = await validateRefreshToken(oldToken)
    if (!stored) {
      await reply.status(401).send({ message: 'Invalid refresh token' })
      return
    }

    await deleteRefreshToken(oldToken)

    // needed for updating role
    const user = await getUserById(stored.owner_id)
    if (!user) {
      await reply.status(401).send({ message: 'Invalid refresh token' })
      return
    }

    const accessToken = createAccessToken(user)
    const refreshToken = await createRefreshToken(user.id)

    reply
      .setCookie('access_token', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' })
      .setCookie('refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/users' })

    await reply.status(200).send()
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}
