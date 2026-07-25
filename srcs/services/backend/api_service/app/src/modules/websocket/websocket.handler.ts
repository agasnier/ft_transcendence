import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { WebSocket, RawData } from 'ws'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { WS_ERRORS } from './ws.error.js'

// ==========================================
// Types & Interfaces
// ==========================================

interface ActiveClient {
	socket: WebSocket
	userId: string
	isAlive: boolean
}

interface JwtPayload {
	id: number
	pseudo: string
}

// Global state tracking all connected WebSocket clients indexed by user ID
export const activeClients = new Map<string, ActiveClient>()

// ==========================================
// Helper Functions
// ==========================================

/**
 * Extracts a cookie value from the raw Cookie header string.
 */
function getCookieValue(cookieHeader: string | undefined, cookieName: string): string | undefined {
	if (!cookieHeader) return undefined
	const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`))
	return match ? decodeURIComponent(match[1]) : undefined
}

/**
 * Sends a JSON payload to a specific user by their ID if their socket is OPEN.
 */
export function sendToUser(userId: string, data: object): boolean {
	const client = activeClients.get(userId)
	if (client && client.socket.readyState === 1) {
		client.socket.send(JSON.stringify(data))
		return true
	}
	return false
}

/**
 * Broadcasts a JSON payload to all connected clients, optionally excluding a user ID.
 */
export function broadcast(data: object, excludeuserId?: string) {
	const rawData = JSON.stringify(data)
	for (const [userId, client] of activeClients.entries()) {
		if (userId !== excludeuserId && client.socket && client.socket.readyState === 1) {
			client.socket.send(rawData)
		}
	}
}

// ==========================================
// Authentication Helper
// ==========================================

/**
 * Authenticates an incoming WebSocket connection using JWT from cookies or query parameters.
 * Returns the decoded user ID or null if authentication fails.
 */
function authenticateWebSocket(req: FastifyRequest, app: FastifyInstance): number | null {
	try {
		const rawCookieHeader = req.headers['cookie'] || (req.raw?.headers as any)?.cookie
		const tokenFromCookie = req.cookies?.access_token || getCookieValue(rawCookieHeader, 'access_token')
		const queryToken = (req.query as any)?.token
		const finalToken = tokenFromCookie || queryToken

		if (!finalToken) {
			app.log.warn(`[WS Auth Failed] No token found (Cookie header: ${rawCookieHeader})`)
			return null
		}

		const decoded = jwt.verify(finalToken, env.jwtPublicKey, { algorithms: ['ES256'] }) as JwtPayload
		return decoded.id
	} catch (err: any) {
		app.log.warn(`[WS Auth Failed] JWT verification failed: ${err?.message}`)
		return null
	}
}

/**
 * Safely closes or destroys a WebSocket connection.
 */
function closeSocket(connection: any, code: number, reason: string): void {
	const ws = connection.socket ?? connection.raw ?? connection
	if (ws && typeof ws.close === 'function') {
		try {
			ws.close(code, reason)
		} catch {
			if (typeof connection.destroy === 'function') connection.destroy()
		}
	} else if (typeof connection.destroy === 'function') {
		connection.destroy()
	}
}

// ==========================================
// Main Connection Handler
// ==========================================

/**
 * Handles incoming WebSocket connections, authenticates the client, and sets up event listeners.
 */
export function handleWebSocket(connection: any, req: FastifyRequest, app: FastifyInstance): void {
	const socket: WebSocket = connection.socket ?? connection.raw ?? connection

	const userIdNum = authenticateWebSocket(req, app)
	if (userIdNum === null) {
		app.log.warn(WS_ERRORS.UNAUTHORIZED.log)
		closeSocket(connection, WS_ERRORS.UNAUTHORIZED.code, WS_ERRORS.UNAUTHORIZED.reason)
		return
	}

	const userId = String(userIdNum)
	app.log.info(`[WS] Client connected and authenticated: ID ${userId}`)

	const clientInfo: ActiveClient = {
		socket,
		userId,
		isAlive: true,
	}
	activeClients.set(userId, clientInfo)
	broadcast({ type: 'USER_STATUS', payload: { userId, status: 'online' } }, userId)

	// Heartbeat response listener
	socket.on('pong', () => {
		const client = activeClients.get(userId)
		if (client) {
			client.isAlive = true
		}
	})

	// Message handling
	socket.on('message', (rawData: RawData) => {
		try {
			const event = JSON.parse(rawData.toString())
			app.log.info(`[WS] Message received from ${userId}:`, event)

			switch (event.type) {
				case 'PING':
					socket.send(JSON.stringify({ type: 'PONG' }))
					break
				case 'CHAT_MESSAGE':
					broadcast({
						type: 'NEW_CHAT_MESSAGE',
						payload: {
							senderId: userId,
							text: event.payload?.text,
							timestamp: new Date().toISOString(),
						},
					})
					break
				default:
					socket.send(JSON.stringify({ type: 'ERROR', payload: 'Unsupported event type' }))
			}
		} catch {
			socket.send(JSON.stringify({ type: 'ERROR', payload: 'Invalid JSON format' }))
		}
	})

	// Connection closure listener
	socket.on('close', (code: number, reason: Buffer) => {
		app.log.info(`[WS] Client disconnected: ${userId} (Code: ${code}, Reason: ${reason ? reason.toString() : ''})`)
		activeClients.delete(userId)
		broadcast({ type: 'USER_STATUS', payload: { userId, status: 'offline' } })
	})

	// Connection error listener
	socket.on('error', (err: Error) => {
		app.log.error(err, `[WS] Error on socket for user ${userId}`)
	})
}

// ==========================================
// Heartbeat Monitor
// ==========================================

/**
 * Periodically pings all connected clients every 30 seconds to detect dead connections.
 */
export function startHeartbeatMonitor(app: FastifyInstance): void {
	const interval = setInterval(() => {
		for (const [userId, client] of activeClients.entries()) {
			if (client.isAlive === false) {
				app.log.warn(`[WS] Dead session detected for user ${userId}. Terminating socket.`)
				if (client.socket && typeof client.socket.terminate === 'function') {
					client.socket.terminate()
				}
				activeClients.delete(userId)
				continue
			}

			client.isAlive = false
			if (client.socket && typeof client.socket.ping === 'function') {
				client.socket.ping()
			}
		}
	}, 30000)

	app.addHook('onClose', (instance, done) => {
		clearInterval(interval)
		done()
	})
}