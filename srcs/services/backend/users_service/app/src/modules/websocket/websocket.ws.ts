import type { WebSocket } from 'ws'
import { setUserOffline, setUserOnline } from '../presence/presence.service.js'

const sockets = new Set<WebSocket>()

function getSocket(connection: any): WebSocket {
	return connection.socket ?? connection.raw ?? connection
}

export function wsAddSocket(connection: any, userId: number): void {
	const socket = getSocket(connection)
	sockets.add(socket)
	connected(userId)

	socket.on('close', () => {
		if (!sockets.has(socket))
			return
		sockets.delete(socket)
		disconnected(userId)
	})

	socket.on('error', () => {
		if (!sockets.has(socket))
			return
		sockets.delete(socket)
		disconnected(userId)
	})
}

// TODO send only to user concerned
function wsSendAll(data: object): void {
	const raw = JSON.stringify(data)
	for (const socket of sockets) {
		if (socket.readyState === 1) {
			socket.send(raw)
		}
	}
}

export function connected(userId: number): void {
	void setUserOnline(userId)
	wsSendAll({ type: 'USER_ONLINE', payload: { userId } })
}

export function disconnected(userId: number): void {
	void setUserOffline(userId)
	wsSendAll({ type: 'USER_OFFLINE', payload: { userId } })
}
