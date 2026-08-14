import type { FastifyInstance } from 'fastify'
import { userAuthHook } from '../auth/auth.controller.js'
import { setUserOnline, setUserOffline } from './presence.service.js'

export async function presenceRoutes(app: FastifyInstance): Promise<void> {
	app.get('/ws', { preHandler: [userAuthHook], websocket: true}, (socket, req) => {
		const userId = req.user!.id
		setUserOnline(userId)

		// TODO here add a ping-pong to avoid deco/reco all 60sec (visible in ChatHeader)

		socket.on('close', () => {
			setUserOffline(userId)
		})
	})
}
