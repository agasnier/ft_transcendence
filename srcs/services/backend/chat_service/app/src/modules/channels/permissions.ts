import type { FastifyRequest, FastifyReply } from 'fastify'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { channelMembers } from '../../db/schema.js'

export function requireChannelModeratorOrAdmin() {
	return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
		if (!request.user) {
			await reply.status(401).send({ message: 'Not authenticated' })
			return
		}
		
		if (request.user.role === 'admin') {
			return
		}

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