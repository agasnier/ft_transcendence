import type { FastifyInstance } from 'fastify'
import { sendFriendRequestController, acceptFriendRequestController, declineFriendRequestController , listFriendsController, removeFriendController, listIncomingRequestsController, listOutgoingRequestsController } from './friends.controller.js'
import { sendFriendRequestSchema, acceptFriendRequestSchema, declineFriendRequestSchema, listFriendsSchema, removeFriendSchema, listFriendRequestsSchema } from './friends.schema.js'
import { userAuthHook } from '../auth/auth.controller.js'

export async function friendsRoutes(app: FastifyInstance) {
	app.post('/:userId', { schema: sendFriendRequestSchema, preHandler: [userAuthHook] }, sendFriendRequestController)
	app.patch('/:userId/accept', { schema: acceptFriendRequestSchema, preHandler: [userAuthHook] }, acceptFriendRequestController)
	app.delete('/:userId/decline', { schema: declineFriendRequestSchema, preHandler: [userAuthHook] }, declineFriendRequestController)
	app.get('/', { schema: listFriendsSchema, preHandler: [userAuthHook] }, listFriendsController)
	app.delete('/:userId', { schema: removeFriendSchema, preHandler: [userAuthHook] }, removeFriendController)
	app.get('/requests/incoming', { schema: listFriendRequestsSchema, preHandler: [userAuthHook] }, listIncomingRequestsController)
	app.get('/requests/outgoing', { schema: listFriendRequestsSchema, preHandler: [userAuthHook] }, listOutgoingRequestsController)
}