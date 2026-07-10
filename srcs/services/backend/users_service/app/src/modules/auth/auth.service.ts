import { createHmac, randomBytes } from 'node:crypto'
import { sign } from 'jsonwebtoken'
import { eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { users, jwtRefreshToken } from '../../db/schema.js'
import { env } from '../../config/env.js'

function hash(value: string): string {
  return createHmac('sha256', env.pepper).update(value).digest('hex')
}

export async function verifyCredentials(pseudo: string, password: string) {
  const rows = await db
    .select({ id: users.id, pseudo: users.pseudo, role: users.role, password: users.password })
    .from(users)
    .where(eq(users.pseudo, pseudo))
    .limit(1)

  const user = rows[0]
  if (!user || hash(password) !== user.password)
    return null

  return { id: user.id, pseudo: user.pseudo, role: user.role }
}

export function createAccessToken(user: { id: number; pseudo: string; role: string }): string {
  return sign(user, env.jwtPrivateKey, { algorithm: 'ES256', expiresIn: env.accessTokenExpiration })
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
    .select({ id: users.id, pseudo: users.pseudo, role: users.role })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  return rows[0]
}
