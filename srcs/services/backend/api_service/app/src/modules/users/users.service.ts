import { eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'

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

export async function createUser(pseudo: string, password: string) {

  // TODO hash the password when pepper vault plug in
  const passwordHash = password

  const [result] = await db
    .insert(users)
    .values({ pseudo, password: passwordHash })

  return { id: result.insertId, pseudo }
}
