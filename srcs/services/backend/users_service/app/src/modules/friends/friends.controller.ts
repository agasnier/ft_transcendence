import type { FastifyRequest, FastifyReply } from 'fastify'
import { sendFriendRequest, acceptFriendRequest, listFriends, declineFriendRequest, removeFriend } from './friends.service.js'

export async function sendFriendRequestController(req: FastifyRequest, reply: FastifyReply) {
	if (!req.user) {
		await reply.code(401).send({ message: 'Not authentificated' })
		return
	}
	const { userId } = req.params as { userId: string }
	const targetId = Number(userId)
	if (targetId === req.user.id) {
		await reply.code(400).send({ message: 'Cannot add yourself' })
		return
	}
	await sendFriendRequest(req.user.id, targetId)
	return reply.code(201).send({ message: 'Friend request sent' })
}

export async function acceptFriendRequestController(req: FastifyRequest, reply: FastifyReply) {
	if (!req.user) {
		await reply.code(401).send({ message: 'Not authentificated' })
		return
	}
	const { userId } = req.params as { userId: string }
	await acceptFriendRequest(Number(userId), req.user.id)
	return reply.send({ message: 'Friend request accepted' })
}

export async function declineFriendRequestController(req: FastifyRequest, reply: FastifyReply) {
	if (!req.user) {
		await reply.code(401).send({ message: 'Not authentificated' })
		return
	}
	const { userId } =req.params as { userId: string }
	await declineFriendRequest(Number(userId), req.user.id)
	return reply.send({ message: 'Friend request declined' })
}

export async function listFriendsController(req: FastifyRequest, reply: FastifyReply) {
	if (!req.user) {
		await reply.code(401).send({ message: 'Not authentificated' })
		return
	}
	const { search } = req.query as { search?: string }
	const friendsList = await listFriends(req.user.id, search)
	return reply.send(friendsList)
}

export async function removeFriendController(req: FastifyRequest, reply: FastifyReply) {
	if (!req.user) {
		await reply.code(401).send({ message: 'Not authentificated' })
		return
	}
	const { userId } = req.params as { userId: string }
	await removeFriend(req.user.id, Number(userId))
	return reply.send({ message: 'Friend removed' })
}