import { eq, and, or, inArray, like } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { friends } from '../../db/schema.js'
import { users } from '../../db/schema.js'

export async function sendFriendRequest(requesterId: number, addresseeId: number) {
	await db.insert(friends).values({ requesterId, addresseeId, status: 'pending' })
}

export async function acceptFriendRequest(requesterId: number, addresseeId: number) {
	await db.update(friends)
		.set({ status: 'accepted' })
		.where(and(eq(friends.requesterId, requesterId), eq(friends.addresseeId, addresseeId)))
}

export async function declineFriendRequest(requesterId: number, addresseeId: number) {
	await db
		.delete(friends)
		.where(
			and(
				eq(friends.requesterId, requesterId),
				eq(friends.addresseeId, addresseeId),
				eq(friends.status, 'pending'), // we can decline only pending request
			)
		)
}

export async function listFriends(userId: number, search?: string) {
	// take all accepted relations using userId
	const relations = await db
		.select()
		.from(friends)
		.where(
			and(
				eq(friends.status, "accepted"),
				or(eq(friends.requesterId, userId), eq(friends.addresseeId, userId))
			)
		)
		if (relations.length === 0) {
			return []
		}

		// extract "other" id for each relation
		const friendIds = relations.map((r) => 
			r.requesterId === userId ? r.addresseeId : r.requesterId
		)

		// take friends info, with displayName filter
		const conditions = search
			? and(inArray(users.id, friendIds), like(users.displayName, `%${search}%`))
			: inArray(users.id, friendIds)

		return db
			.select({
				id: users.id,
				pseudo: users.pseudo,
				displayName: users.displayName,
				avatarUrl: users.avatarUrl,
				isOnline: users.isOnline,
			})
			.from(users)
			.where(conditions)
}
