import type { FastifyRequest, FastifyReply } from 'fastify'
import { sendFriendRequest, acceptFriendRequest, listFriends, declineFriendRequest, removeFriend, listIncomingRequests, listOutgoingRequests } from './friends.service.js'

export async function sendFriendRequestController(req: FastifyRequest, reply: FastifyReply) {
	if (!req.user) {
		await reply.code(401).send({ message: 'Not authenticated' })
		return
	}
	const { userId } = req.params as { userId: string }
	const targetId = Number(userId)
	if (targetId === req.user.id) {
		await reply.code(400).send({ message: 'Cannot add yourself' })
		return
	}
	try {
        const result = await sendFriendRequest(req.user.id, targetId)
        if (result.autoAccepted) {
            return reply.code(200).send({ message: 'Friend request accepted' })
        }
        return reply.code(201).send({ message: 'Friend request sent' })
    } catch (err) {
        if (err instanceof Error && err.message === 'ALREADY_FRIENDS') {
            return reply.code(409).send({ message: 'Already friends' })
        }
        if (err instanceof Error && err.message === 'REQUEST_ALREADY_SENT') {
            return reply.code(409).send({ message: 'Friend request already sent' })
        }
        req.log.error(err)
        return reply.code(500).send({ message: 'Internal error' })
    }
}

export async function acceptFriendRequestController(req: FastifyRequest, reply: FastifyReply) {
	if (!req.user) {
		await reply.code(401).send({ message: 'Not authenticated' })
		return
	}
	const { userId } = req.params as { userId: string }
	await acceptFriendRequest(Number(userId), req.user.id)
	return reply.send({ message: 'Friend request accepted' })
}

export async function declineFriendRequestController(req: FastifyRequest, reply: FastifyReply) {
	if (!req.user) {
		await reply.code(401).send({ message: 'Not authenticated' })
		return
	}
	const { userId } =req.params as { userId: string }
	await declineFriendRequest(Number(userId), req.user.id)
	return reply.send({ message: 'Friend request declined' })
}

export async function listFriendsController(req: FastifyRequest, reply: FastifyReply) {
	if (!req.user) {
		await reply.code(401).send({ message: 'Not authenticated' })
		return
	}
	const { search } = req.query as { search?: string }
	const friendsList = await listFriends(req.user.id, search)
	return reply.send(friendsList)
}

export async function removeFriendController(req: FastifyRequest, reply: FastifyReply) {
	if (!req.user) {
		await reply.code(401).send({ message: 'Not authenticated' })
		return
	}
	const { userId } = req.params as { userId: string }
	await removeFriend(req.user.id, Number(userId))
	return reply.send({ message: 'Friend removed' })
}

export async function listIncomingRequestsController(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user) {
    	await reply.code(401).send({ message: 'Not authenticated' })
		return
  }
  const requests = await listIncomingRequests(req.user.id)
  return reply.send(requests)
}

export async function listOutgoingRequestsController(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user) {
		await reply.code(401).send({ message: 'Not authenticated' })
		return
  }
  const requests = await listOutgoingRequests(req.user.id)
  return reply.send(requests)
}