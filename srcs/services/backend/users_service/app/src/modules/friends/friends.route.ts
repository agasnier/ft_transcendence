import type { FastifyInstance } from 'fastify'
import { sendFriendRequestController, acceptFriendRequestController, declineFriendRequestController , listFriendsController } from './friends.controller.js'
import { sendFriendRequestSchema, acceptFriendRequestSchema, declineFriendRequestSchema, listFriendsSchema } from './friends.schema.js'
import { userAuthHook } from '../auth/auth.controller.js'

export async function friendsRoutes(app: FastifyInstance) {
	app.post('/:userId', { schema: sendFriendRequestSchema, preHandler: [userAuthHook] }, sendFriendRequestController)
	app.patch('/:userId/accept', { schema: acceptFriendRequestSchema, preHandler: [userAuthHook] }, acceptFriendRequestController)
	app.delete('/:userId/decline', { schema: declineFriendRequestSchema, preHandler: [userAuthHook] }, declineFriendRequestController)
	app.get('/', { schema: listFriendsSchema, preHandler: [userAuthHook] }, listFriendsController)
}