import type { FastifyInstance } from 'fastify'
import { userAuthHook } from '../auth/auth.controller.js'
import { setUserOnline, setUserOffline } from './presence.service.js'

export async function presenceRoutes(app: FastifyInstance): Promise<void> {
	app.get('/ws', { preHandler: [userAuthHook], websocket: true}, (connection, req) => {
		const userId = req.user!.id
		setUserOnline(userId)
		connection.socket.on('close', () => {
			setUserOffline(userId)
		})
	})
}