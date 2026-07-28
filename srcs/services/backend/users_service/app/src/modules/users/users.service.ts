import { eq, or } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'
import { hashPassword, verifyPassword } from '../vault/hash.js'


export async function getAllUsers() {
  return await db
    .select({ id: users.id, mail: users.mail, pseudo: users.pseudo, role: users.role })
    .from(users)
}

export async function getUserById(id: number) {
  const rows = await db
    .select({ id: users.id, mail: users.mail, pseudo: users.pseudo, role: users.role })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
  return rows[0]
}

export async function verifyCredentials(login: string, password: string) {
  const rows = await db
    .select({ id: users.id, pseudo: users.pseudo, password: users.password })
    .from(users)
    .where(or(eq(users.mail, login), eq(users.pseudo, login)))
    .limit(1)

  const user = rows[0]
  if (!user)
    return null
  if (!(await verifyPassword(user.password, password)))
    return null

  return { id: user.id, pseudo: user.pseudo }
}

export async function createUser(mail: string, pseudo: string, password: string) {

  const passwordHash = await hashPassword(password)

  const [result] = await db
    .insert(users)
    .values({ mail, pseudo, password: passwordHash })

  return await getUserById(result.insertId)
}

export async function updateUser(id: number, data: { mail?: string; pseudo?: string; password?: string }) {
  const User = await getUserById(id)
  if (!User)
    return null

  const newData: { mail?: string; pseudo?: string; password?: string } = {}
  if (data.mail !== undefined)
    newData.mail = data.mail
  if (data.pseudo !== undefined)
    newData.pseudo = data.pseudo
  if (data.password !== undefined)
    newData.password = await hashPassword(data.password)
  await db.update(users).set(newData).where(eq(users.id, id))

  return await getUserById(id)
}

export async function updateUserProfile(id: number, data: { displayName?: string; bio?: string }) {
  await db.update(users).set(data).where(eq(users.id, id))
  return db.query.users.findFirst({ where: eq(users.id, id )})
}

export async function getUserProfile(id: number) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { id: true, displayName: true, avatarUrl: true, bio: true, isOnline: true},
  })
}

export async function updateAvatar(id: number, avatarUrl: string) {
  await db.update(users).set({ avatarUrl }).where(eq(users.id, id))
}

export async function deleteUser(id: number) {
  const [result] = await db.delete(users).where(eq(users.id, id))
  return result.affectedRows > 0
}
