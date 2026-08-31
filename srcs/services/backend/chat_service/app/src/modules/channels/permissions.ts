import type { FastifyRequest, FastifyReply } from 'fastify'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { channelMembers } from '../../db/schema.js'


// Route guard factory: returns a preHandler that only lets the request through if
// the caller is either a global admin (role stored in their JWT, no DB lookup needed),
// or the moderator of the specific channel targeted by the ":id" route param.
// Used on all channel-management routes (rename, kick, add members, write mode, etc.).
export function requireChannelModeratorOrAdmin() {
	return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
		if (!request.user) {
			await reply.status(401).send({ message: 'Not authenticated' })
			return
		}
		
		// Global admins bypass the per-channel role check entirely.
		if (request.user.role === 'admin') {
			return
		}

		// Otherwise, the caller must be this specific channel's moderator.
		const { id } = request.params as { id: string }
		const membership = await db.query.channelMembers.findFirst({
			where: and(eq(channelMembers.channelId, Number(id)), eq(channelMembers.userId, request.user.id)),
		})

		if (!membership || membership.role !== 'moderator') {
			await reply.status(403).send({ message: 'Only the channel moderator or an admin can do this'})
			return
		}
	}
}