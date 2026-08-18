import type { FastifyReply, FastifyRequest } from 'fastify'
import { createCookie } from '../auth/auth.service.js'
import { validateAccessToken } from '../vault/jwt.js'
import { getTwoFAByUserId, setTwoFAEnabled, setupTwoFA, verifyTwoFA } from './twofa.service.js'

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

export async function pending2FAHook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const accessToken = request.cookies.access_token
  if (!accessToken) {
    await reply.status(401).send({ message: 'Not authenticated' })
    return
  }

  const user = await validateAccessToken(accessToken)
  if (!user || user.twofa !== 'pending') {
    await reply.status(401).send({ message: 'Not authenticated' })
    return
  }

  request.user = user
}

// controllers
export async function enableController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const updated = await setTwoFAEnabled(request.user!.id, true)
    if (!updated) {
      await reply.status(400).send({ message: '2FA setup required first' })
      return
    }

    await reply.status(200).send({ message: '2FA enabled' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function setupController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const result = await setupTwoFA(request.user!.id, request.user!.pseudo)
    if (!result) {
      await reply.status(409).send({ message: '2FA already enabled' })
      return
    }

    await reply.status(200).send(result)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function statusController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const row = await getTwoFAByUserId(request.user!.id)
    await reply.status(200).send({ enabled: row?.enabled ?? false })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function verifyController(request: FastifyRequest<{ Body: { code: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const valid = await verifyTwoFA(request.user!.id, request.body.code)
    if (!valid) {
      await reply.status(401).send({ message: 'Invalid 2FA code' })
      return
    }

    await createCookie(reply, {
      id: request.user!.id,
      pseudo: request.user!.pseudo,
      role: request.user!.role,
    })
    await reply.status(200).send({ message: 'Logged in' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function disableController(request: FastifyRequest<{ Body: { code: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const valid = await verifyTwoFA(request.user!.id, request.body.code)
    if (!valid) {
      await reply.status(401).send({ message: 'Invalid 2FA code' })
      return
    }

    const updated = await setTwoFAEnabled(request.user!.id, false)
    if (!updated) {
      await reply.status(400).send({ message: '2FA setup required first' })
      return
    }

    await reply.status(200).send({ message: '2FA disabled' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}
