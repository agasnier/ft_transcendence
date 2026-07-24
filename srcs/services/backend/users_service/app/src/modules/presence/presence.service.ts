import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'

export async function setUserOnline(userId: number) {
	await db.update(users).set({ isOnline: true }).where(eq(users.id, userId))
}

export async function setUserOffline(userId: number) {
	await db.update(users).set({ isOnline: false }).where(eq(users.id, userId))
}