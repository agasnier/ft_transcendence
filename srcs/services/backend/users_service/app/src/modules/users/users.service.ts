import { createHmac } from 'node:crypto'
import { eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'
import { env } from '../../config/env.js'

export async function getAllUsers() {
  return await db
    .select({ id: users.id, pseudo: users.pseudo })
    .from(users)
}

export async function getUserById(id: number) {
  const rows = await db
    .select({ id: users.id, pseudo: users.pseudo })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
  return rows[0]
}

function hash(password: string): string {
  return createHmac('sha256', env.pepper).update(password).digest('hex')
}

export async function createUser(pseudo: string, password: string) {

  const passwordHash = hash(password)

  const [result] = await db
    .insert(users)
    .values({ pseudo, password: passwordHash })

  return { id: result.insertId, pseudo }
}

export async function updateUser(id: number, data: { pseudo?: string; password?: string }) {
  const User = await getUserById(id)
  if (!User)
    return null

  const newData: { pseudo?: string; password?: string } = {}
  if (data.pseudo !== undefined)
    newData.pseudo = data.pseudo
  if (data.password !== undefined) {

    // TODO hash the password when pepper vault plug in
    newData.password = data.password

  }
  await db.update(users).set(newData).where(eq(users.id, id))

  return await getUserById(id)
}

export async function deleteUser(id: number) {
  const [result] = await db.delete(users).where(eq(users.id, id))
  return result.affectedRows > 0
}
