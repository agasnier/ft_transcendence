import argon2 from 'argon2'
import { eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'
import { env } from '../../config/env.js'


// argon2 need to have real octect not in hex
const pepper = Buffer.from(env.pepper, 'hex')

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, { secret: pepper })
}

export async function verifyPassword(storedHash: string , password: string): Promise<boolean> {
  return await argon2.verify(storedHash, password, { secret: pepper })
}

export async function getAllUsers() {
  return await db
    .select({ id: users.id, pseudo: users.pseudo, role: users.role })
    .from(users)
}

export async function getUserById(id: number) {
  const rows = await db
    .select({ id: users.id, pseudo: users.pseudo, role: users.role })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
  return rows[0]
}

export async function verifyCredentials(pseudo: string, password: string) {
  const rows = await db
    .select({ id: users.id, pseudo: users.pseudo, password: users.password })
    .from(users)
    .where(eq(users.pseudo, pseudo))
    .limit(1)

  const user = rows[0]
  if (!user)
    return null
  if (!(await verifyPassword(user.password, password)))
    return null

  return { id: user.id, pseudo: user.pseudo }
}

export async function createUser(pseudo: string, password: string) {

  const passwordHash = await hashPassword(password)

  const [result] = await db
    .insert(users)
    .values({ pseudo, password: passwordHash })

  return await getUserById(result.insertId)
}

export async function updateUser(id: number, data: { pseudo?: string; password?: string }) {
  const User = await getUserById(id)
  if (!User)
    return null

  const newData: { pseudo?: string; password?: string } = {}
  if (data.pseudo !== undefined)
    newData.pseudo = data.pseudo
  if (data.password !== undefined)
    newData.password = await hashPassword(data.password)
  await db.update(users).set(newData).where(eq(users.id, id))

  return await getUserById(id)
}

export async function deleteUser(id: number) {
  const [result] = await db.delete(users).where(eq(users.id, id))
  return result.affectedRows > 0
}
