import type { WebSocket } from 'ws'

type HeartbeatSocket = WebSocket & { isAlive?: boolean }

const socketsByUser = new Map<number, Set<HeartbeatSocket>>()

// nginx close connection by default at 60s, refresh connection every 20s with heartbeat
const HEARTBEAT_INTERVAL_MS = 20000

setInterval(() => {
	for (const userSockets of socketsByUser.values()) {
		for (const socket of userSockets) {
			if (socket.isAlive === false) {
				socket.terminate()
				continue
			}
			socket.isAlive = false
			socket.ping()
		}
	}
}, HEARTBEAT_INTERVAL_MS)

// functions
export function wsAddChannelSocket(socket: HeartbeatSocket, userId: number): void {
	socket.isAlive = true
	socket.on('pong', () => { socket.isAlive = true })

	const wasOffline = !socketsByUser.has(userId)
	let userSockets = socketsByUser.get(userId)
	if (!userSockets) {
		userSockets = new Set()
		socketsByUser.set(userId, userSockets)
	}
	userSockets.add(socket)

	wsPresenceSnapshot(socket)
	if (wasOffline)
		wsUserOnline(userId)

	let cleaned = false
	const cleanup = () => {
		if (cleaned)
			return
		cleaned = true
		userSockets.delete(socket)
		if (userSockets.size === 0) {
			socketsByUser.delete(userId)
			wsUserOffline(userId)
		}
	}

	socket.on('close', cleanup)
	socket.on('error', cleanup)
}

function wsSendToSocket(socket: WebSocket, data: object): void {
	if (socket.readyState === 1)
		socket.send(JSON.stringify(data))
}

function wsSendAll(data: object): void {
	const raw = JSON.stringify(data)
	for (const userSockets of socketsByUser.values()) {
		for (const socket of userSockets) {
			if (socket.readyState === 1)
				socket.send(raw)
		}
	}
}

function wsSendToUser(userId: number, data: object): void {
	const raw = JSON.stringify(data)
	for (const socket of socketsByUser.get(userId) ?? []) {
		if (socket.readyState === 1)
			socket.send(raw)
	}
}

export function wsForceDisconnect(userId: number): void {
  const userSockets = socketsByUser.get(userId)
  if (!userSockets) return

  for (const socket of userSockets) {
    wsSendToSocket(socket, { type: 'FORCE_LOGOUT' })
    socket.close()
  }
}

// messages
export function wsPresenceSnapshot(socket: WebSocket): void {
	const userIds: number[] = []
	for (const id of socketsByUser.keys())
		userIds.push(id)
	wsSendToSocket(socket, { type: 'PRESENCE_SNAPSHOT', payload: { userIds } })
}

export function wsUserOnline(userId: number): void {
	wsSendAll({ type: 'USER_ONLINE', payload: { userId } })
}

export function wsUserOffline(userId: number): void {
	wsSendAll({ type: 'USER_OFFLINE', payload: { userId } })
}

export function wsUserAvatarChanged(userId: number, avatarUrl: string | null): void {
	wsSendAll({type: 'USER_AVATAR_CHANGED', payload: { userId, avatarUrl } })
}

export function wsChannelCreatedTo(userId: number, channel: { id: number, name: string | null, type: string, description: string | null, avatarUrl?: string | null, createdAt: Date | string, memberCount?: number }): void {
	wsSendToUser(userId, { type: 'CHANNEL_CREATED', payload: channel })
}

export function wsChannelDeleted(id: number): void {
	wsSendAll({ type: 'CHANNEL_DELETED', payload: { id } })
}

export function wsChannelDeletedTo(userId: number, id: number): void {
	wsSendToUser(userId, { type: 'CHANNEL_DELETED', payload: { id } })
}

export function wsChannelUpdatedTo(userId: number, channel: { id: number, name: string | null, type: string, description: string | null, avatarUrl?: string | null }): void {
	wsSendToUser(userId, { type: 'CHANNEL_UPDATED', payload: channel })
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

export function getOnlineUserCount() : number{
	return socketsByUser.size
}

export function wsMessageUpdated(message: {
    id: number
    channelId: number
    senderId: number
    senderPseudo: string | null
    content: string
    createdAt: Date | string
    type: string
    fileId: number | null
    file: unknown
}): void {
    wsSendAll({ type: 'MESSAGE_UPDATED', payload: message })
}

export function wsMessageDeleted(id: number, channelId: number): void {
    wsSendAll({ type: 'MESSAGE_DELETED', payload: { id, channelId } })
}
