import type { FastifyReply } from 'fastify'
import { createHmac, randomBytes } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { users, jwtRefreshToken } from '../../db/schema.js'
import { env } from '../../config/env.js'

function hash(value: string): string {
  return createHmac('sha256', env.pepper).update(value).digest('hex')
}

export async function createCookie(reply: FastifyReply, user: { id: number; pseudo: string }): Promise<void> {
  const accessToken = createAccessToken(user)
  const refreshToken = await createRefreshToken(user.id)

  reply
    .setCookie('access_token', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' })
    .setCookie('refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/auth' })
}

export async function verifyCredentials(pseudo: string, password: string) {
  const rows = await db
    .select({ id: users.id, pseudo: users.pseudo, password: users.password })
    .from(users)
    .where(eq(users.pseudo, pseudo))
    .limit(1)

  const user = rows[0]
  if (!user || hash(password) !== user.password)
    return null

  return { id: user.id, pseudo: user.pseudo }
}

export function createAccessToken(user: { id: number; pseudo: string }): string {
  return jwt.sign(user, env.jwtPrivateKey, { algorithm: 'ES256', expiresIn: env.accessTokenExpiration })
}

export function validateAccessToken(token: string): { id: number; pseudo: string } | null {
  try {
    return jwt.verify(token, env.jwtPublicKey, { algorithms: ['ES256'] }) as { id: number; pseudo: string }
  } catch {
    return null
  }
}

export async function createRefreshToken(owner_id: number): Promise<string> {
  const token = randomBytes(32).toString('hex')

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + env.refreshTokenExpirationDays)

  await db
    .insert(jwtRefreshToken)
    .values({ owner_id, token_hash: hash(token), expires_at: expiresAt })

  return token
}

export async function deleteRefreshToken(token: string): Promise<void> {
  await db
    .delete(jwtRefreshToken)
    .where(eq(jwtRefreshToken.token_hash, hash(token)))
}

export async function validateRefreshToken(token: string) {
  const rows = await db
    .select()
    .from(jwtRefreshToken)
    .where(eq(jwtRefreshToken.token_hash, hash(token)))
    .limit(1)

  const stored = rows[0]
  if (!stored || stored.expires_at < new Date())
    return null

  return stored
}

export async function getUserById(id: number) {
  const rows = await db
    .select({ id: users.id, pseudo: users.pseudo })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  return rows[0]
}
