import type { FastifyReply, FastifyRequest } from 'fastify'
import { createCookie, createPending2FACookie, deleteRefreshToken, validateRefreshToken } from './auth.service.js'
import { createUser, verifyCredentials, getUserById } from '../users/users.service.js'
import { getTwoFAByUserId } from '../twofa/twofa.service.js'
import { validateAccessToken } from '../vault/jwt.js'

// hooks
export async function userAuthHook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const accessToken = request.cookies.access_token
  if (!accessToken) {
    await reply.status(401).send({ message: 'Not authenticated' })
    return
  }

  const user = await validateAccessToken(accessToken)
  if (!user || user.twofa === 'pending') {
    await reply.status(401).send({ message: 'Not authenticated' })
    return
  }

  request.user = user
}

// controllers
export async function registerController(
  request: FastifyRequest<{ Body: { mail: string; pseudo: string; password: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const { mail, pseudo, password } = request.body
    const user = await createUser(mail, pseudo, password)

    // auto-login on signup: issue tokens + cookies for the new user
    await createCookie(reply, { id: user.id, pseudo: user.pseudo, role: user.role })

    await reply.status(201).send(user)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}


export async function loginController(
  request: FastifyRequest<{ Body: { login: string; password: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const { login, password } = request.body
    const user = await verifyCredentials(login, password)
    if (!user) {
      await reply.status(401).send({ message: 'Invalid credentials' })
      return
    }

    const twoFA = await getTwoFAByUserId(user.id)
    if (twoFA?.enabled) {
      await createPending2FACookie(reply, user)
      await reply.status(200).send({ requires2FA: true })
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
      .clearCookie('refresh_token', { path: '/auth' })

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
      const user = await validateAccessToken(accessToken)
      if (user && user.twofa !== 'pending') {
        await reply.status(200).send({ id: user.id, pseudo: user.pseudo, role: user.role })
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
