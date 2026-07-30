import type { WebSocket } from 'ws'

const sockets = new Set<WebSocket>()

function getSocket(connection: any): WebSocket {
	return connection.socket ?? connection.raw ?? connection
}

export function wsAddChannelSocket(connection: any): void {
	const socket = getSocket(connection)
	sockets.add(socket)

	socket.on('close', () => {
		sockets.delete(socket)
	})

	socket.on('error', () => {
		sockets.delete(socket)
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

export function wsChannelCreated(channel: { id: number, name: string | null, type: string, description: string | null, createdAt: Date | string }): void {
	wsSendAll({ type: 'CHANNEL_CREATED', payload: channel })
}

export function wsChannelDeleted(id: number): void {
	wsSendAll({ type: 'CHANNEL_DELETED', payload: { id } })
}

export function wsMessageCreated(message: {
	id: number
	channelId: number
	senderId: number
	content: string
	createdAt: Date | string
}): void {
	wsSendAll({ type: 'MESSAGE_CREATED', payload: message })
}
