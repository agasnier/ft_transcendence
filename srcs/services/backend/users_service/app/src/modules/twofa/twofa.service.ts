import { eq } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { twoFA } from '../../db/schema.js'

export async function getTwoFAByUserId(userId: number) {
  const rows = await db
    .select()
    .from(twoFA)
    .where(eq(twoFA.owner_id, userId))
    .limit(1)

  return rows[0] ?? null
}
