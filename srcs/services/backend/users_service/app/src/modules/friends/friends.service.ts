import { eq, and, or, inArray, like } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { friends } from '../../db/schema.js'
import { users } from '../../db/schema.js'

export async function sendFriendRequest(requesterId: number, addresseeId: number) {
  // looking for existing relation
  const existing = await db
    .select()
    .from(friends)
    .where(
      or(
        and(eq(friends.requesterId, requesterId), eq(friends.addresseeId, addresseeId)),
        and(eq(friends.requesterId, addresseeId), eq(friends.addresseeId, requesterId))
      )
    )
    .limit(1)

  const relation = existing[0]

  if (relation) {
    if (relation.status === 'accepted') {
      throw new Error('ALREADY_FRIENDS')
    }
    if (relation.requesterId === requesterId) {
      throw new Error('REQUEST_ALREADY_SENT')
    }
	
    // if the adressee already send request, auto accept it
    await db.update(friends).set({ status: 'accepted' }).where(eq(friends.id, relation.id))
    return { autoAccepted: true }
  }

  await db.insert(friends).values({ requesterId, addresseeId, status: 'pending' })
  return { autoAccepted: false }
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
			})
			.from(users)
			.where(conditions)
}

export async function removeFriend(userId: number, friendId: number) {
	await db
		.delete(friends)
		.where(
			and(
				eq(friends.status, 'accepted'),
				or(
					and(eq(friends.requesterId, userId), eq(friends.addresseeId, friendId)),
					and(eq(friends.requesterId, friendId), eq(friends.addresseeId, userId)),
				)
			)
		)
}

export async function listIncomingRequests(userId: number) {
  const relations = await db
    .select()
    .from(friends)
    .where(and(eq(friends.addresseeId, userId), eq(friends.status, "pending")))

  if (relations.length === 0) return []

  const requesterIds = relations.map((r) => r.requesterId)

  return db
    .select({
      id: users.id,
      pseudo: users.pseudo,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(inArray(users.id, requesterIds))
}

export async function listOutgoingRequests(userId: number) {
  const relations = await db
    .select()
    .from(friends)
    .where(and(eq(friends.requesterId, userId), eq(friends.status, "pending")))

  if (relations.length === 0) return []

  const addresseeIds = relations.map((r) => r.addresseeId)

  return db
    .select({
      id: users.id,
      pseudo: users.pseudo,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(inArray(users.id, addresseeIds))
}