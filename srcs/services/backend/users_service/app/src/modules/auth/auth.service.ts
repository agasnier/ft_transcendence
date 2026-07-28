import type { FastifyReply } from 'fastify'
import { randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { jwtRefreshToken } from '../../db/schema.js'
import { env } from '../../config/env.js'
import { vaultHash } from '../vault/hash.js'
import { createAccessToken } from '../vault/jwt.js'

export async function createCookie(reply: FastifyReply, user: { id: number; pseudo: string }): Promise<string> {
  const accessToken = await createAccessToken(user)
  const refreshToken = await createRefreshToken(user.id)

  reply
    .setCookie('access_token', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' })
    .setCookie('refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/auth' })

  return accessToken
}

export async function createRefreshToken(owner_id: number): Promise<string> {
  const token = randomBytes(32).toString('hex')

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + env.refreshTokenExpirationDays)

  await db
    .insert(jwtRefreshToken)
    .values({ owner_id, token_hash: await vaultHash(token), expires_at: expiresAt })

  return token
}

export async function deleteRefreshToken(token: string): Promise<void> {
  await db
    .delete(jwtRefreshToken)
    .where(eq(jwtRefreshToken.token_hash, await vaultHash(token)))
}

export async function validateRefreshToken(token: string) {
  const rows = await db
    .select()
    .from(jwtRefreshToken)
    .where(eq(jwtRefreshToken.token_hash, await vaultHash(token)))
    .limit(1)

  const stored = rows[0]
  if (!stored || stored.expires_at < new Date())
    return null

  return stored
}
