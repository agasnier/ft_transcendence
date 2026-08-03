import type { WebSocket } from 'ws'

type HeartbeatSocket = WebSocket & { isAlive?: boolean }

const sockets = new Set<WebSocket>()
const socketsByUser = new Map<number, Set<WebSocket>>()

// keep well under nginx's default 60s proxy_read_timeout so idle connections
// never get silently dropped by the proxy before we notice and reconnect
const HEARTBEAT_INTERVAL_MS = 20000

function getSocket(connection: any): WebSocket {
	return connection.socket ?? connection.raw ?? connection
}

export function wsAddChannelSocket(connection: any, userId: number): void {
	const socket = getSocket(connection) as HeartbeatSocket
	socket.isAlive = true
	socket.on('pong', () => { socket.isAlive = true })

	sockets.add(socket)

	if (!socketsByUser.has(userId))
		socketsByUser.set(userId, new Set())
	socketsByUser.get(userId)!.add(socket)

	const cleanup = () => {
		sockets.delete(socket)
		socketsByUser.get(userId)?.delete(socket)
	}

	socket.on('close', cleanup)
	socket.on('error', cleanup)
}

setInterval(() => {
	for (const socket of sockets as Set<HeartbeatSocket>) {
		if (socket.isAlive === false) {
			socket.terminate()
			continue
		}
		socket.isAlive = false
		socket.ping()
	}
}, HEARTBEAT_INTERVAL_MS)

// TODO send only to user concerned
function wsSendAll(data: object): void {
	const raw = JSON.stringify(data)
	for (const socket of sockets) {
		if (socket.readyState === 1) {
			socket.send(raw)
		}
	}
}

function wsSendToUser(userId: number, data: object): void {
	const raw = JSON.stringify(data)
	for (const socket of socketsByUser.get(userId) ?? []) {
		if (socket.readyState === 1) {
			socket.send(raw)
		}
	}
}

export function wsChannelCreatedTo(userId: number, channel: { id: number, name: string | null, type: string, description: string | null, creatorId: number | null, createdAt: Date | string }): void {
	wsSendToUser(userId, { type: 'CHANNEL_CREATED', payload: channel })
}

export function wsChannelDeleted(id: number): void {
	wsSendAll({ type: 'CHANNEL_DELETED', payload: { id } })
}

export function wsChannelDeletedTo(userId: number, id: number): void {
	wsSendToUser(userId, { type: 'CHANNEL_DELETED', payload: { id } })
}

export function wsMessageCreated(message: {
	id: number
	channelId: number
	senderId: number
	senderPseudo: string | null
	content: string
	createdAt: Date | string
}): void {
	wsSendAll({ type: 'MESSAGE_CREATED', payload: message })
}
