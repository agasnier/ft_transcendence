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
