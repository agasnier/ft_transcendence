import { eq } from 'drizzle-orm'
import { generateSecret, generateURI } from 'otplib'

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

export async function setTwoFAEnabled(userId: number, enabled: boolean): Promise<boolean> {
  const [result] = await db
    .update(twoFA)
    .set({ enabled })
    .where(eq(twoFA.owner_id, userId))

  return result.affectedRows > 0
}

export async function setupTwoFA(userId: number, label: string): Promise<{ secret: string; otpauthUrl: string } | null> {
  const existing = await getTwoFAByUserId(userId)
  if (existing?.enabled)
    return null

  const secret = generateSecret()
  const otpauthUrl = generateURI({
    issuer: 'users_service',
    label,
    secret,
  })

  // TODO hash secret with vault 
  
  if (existing) {
    await db
      .update(twoFA)
      .set({ secret, enabled: false })
      .where(eq(twoFA.owner_id, userId))
  } else {
    await db.insert(twoFA).values({
      owner_id: userId,
      secret,
      enabled: false,
    })
  }

  return { secret, otpauthUrl }
}
