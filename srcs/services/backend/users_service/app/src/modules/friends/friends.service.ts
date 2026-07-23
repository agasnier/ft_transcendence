import { eq, and } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { friends } from '../../db/schema.js'

export async function sendFriendRequest(requesterId: number, addresseeId: number) {
	await db.insert(friends).values({ requesterId, addresseeId, status: 'pending' })
}

export async function acceptFriendRequest(requesterId: number, addresseeId: number) {
	await db.update(friends)
		.set({ status: 'accepted' })
		.where(and(eq(friends.requesterId, requesterId), eq(friends.addresseeId, addresseeId)))
}